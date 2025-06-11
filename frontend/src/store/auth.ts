import { defineStore } from 'pinia';
import router from '../router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        accessToken: localStorage.getItem('access_token') || null,
    }),

    getters: {
        isAuthenticated: state => !!state.accessToken,
        userRole: state => state.user?.role || null,
    },

    actions: {
        setToken(token: string) {
            this.accessToken = token;
            localStorage.setItem('access_token', token);
        },
        clearAuth() {
            this.accessToken = null;
            this.user = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        },

        async register(email: string, password: string, firstName = '', lastName = '') {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            this.setToken(data.access_token);
            await this.fetchProfile();
            router.push('/profile');
        },

        async login(email: string, password: string) {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            this.setToken(data.access_token);
            await this.fetchProfile();
        },

        async logout() {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            this.clearAuth();
            router.push('/login');
        },

        async refreshToken() {
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Token jest nieważny.');
            const data = await res.json();
            this.setToken(data.access_token);
            return data.access_token;
        },

        async fetchProfile() {
            let res = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${this.accessToken}` },
                credentials: 'include'
            });
            if (res.status === 401) {
                try {
                    await this.refreshToken();
                    res = await fetch(`${API_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${this.accessToken}` },
                        credentials: 'include'
                    });
                } catch (e) {
                    this.clearAuth();
                    router.push('/login');
                    throw new Error('Sesja wygasła, zaloguj się ponownie.');
                }
            }
            if (!res.ok) throw new Error(await res.text());
            this.user = await res.json();
            localStorage.setItem('user', JSON.stringify(this.user));
        },

        async updateProfile(dto: { email?: string; password?: string; firstName?: string; lastName?: string }) {
            let res = await fetch(`${API_URL}/users/${this.user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`,
                },
                credentials: 'include',
                body: JSON.stringify(dto),
            });

            if (res.status === 401) {
                try {
                    await this.refreshToken();
                    res = await fetch(`${API_URL}/users/${this.user.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify(dto),
                    });
                } catch (e) {
                    this.clearAuth();
                    router.push('/login');
                    throw new Error('Sesja wygasła, zaloguj się ponownie.');
                }
            }

            if (!res.ok) throw new Error(await res.text());
            this.user = await res.json();
            localStorage.setItem('user', JSON.stringify(this.user));
        },

        initFromStorage() {
            this.user = JSON.parse(localStorage.getItem('user') || 'null');
            this.accessToken = localStorage.getItem('access_token') || null;
        },
    },
});
