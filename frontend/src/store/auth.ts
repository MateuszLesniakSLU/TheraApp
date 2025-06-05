import { defineStore } from 'pinia';
import router from '../router';

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        token: localStorage.getItem('token') || null,
    }),

    getters: {
        isAuthenticated: state => !!state.token,
    },
    actions: {
        setToken(token: string) {
            this.token = token;
            localStorage.setItem('token', token);
        },

        /**
         * rejestruje użytkownika do bazy danych
         * @param email - mail użytkownika podczas rejestracji
         * @param password - hasło użytkownika podczas rejestracji
         */
        async register(email: string, password: string) {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            this.setToken(data.access_token);
            await this.fetchProfile();
            router.push('/profile');
        },

        /**
         * logowanie użytkowników, sprawdza bazę, jeżeli istnieje wysyła do /profile
         * @param email - sprawdza zgodność maila z danymi z bazy
         * @param password - sprawdza zgodność hasła z danymi z bazy
         */
        async login(email: string, password: string) {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            this.setToken(data.access_token);
            await this.fetchProfile();
            router.push('/profile');
        },

        /**
         * wylogowywuje użytkownika z konta, wypycha natychmiastowo konto do /login i czyści token sesji w localStorage
         */
        logout() {
            this.token = '';
            this.user = null;
            localStorage.removeItem('token');
            router.push('/login');
        },

        /**
         *  pobiera dane nt. zalogowanego profilu i tokena, obsługuje błąd w razie niezgodności
         */
        async fetchProfile() {
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${this.token}` },
            });
            if (!res.ok) throw new Error(await res.text());
            this.user = await res.json();
            localStorage.setItem('user', JSON.stringify(this.user));
        },

        /**
         * wprowadza zmiany w profilu do bazy danych
         * @param dto
         */
        async updateProfile(dto: { email?: string; password?: string; firstName?: string; lastName?: string }) {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify(dto),
            });
            if (!res.ok) throw new Error(await res.text());
            this.user = await res.json();
            localStorage.setItem('user', JSON.stringify(this.user));
        },

        /**
         * pobiera dane użytkownika z localStorage, jeżeli nie istnieje zwraca null
         */
        initFromStorage() {
            this.user = JSON.parse(localStorage.getItem('user') || 'null');
            this.token = localStorage.getItem('token') || null;
        },

    },
});