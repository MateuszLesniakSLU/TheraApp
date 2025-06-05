import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import Admin from '../views/Admin.vue'
import { useAuthStore } from '../store/auth'
import { pinia } from '../plugins/pinia'

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin,
        meta: { requiresAuth: true, role: 'admin' },
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

/**
 * blokada przed nieautoryzowanym wejściem do panelu admina lub profilu jeżeli niezalogowany
 */
router.beforeEach((to, from, next) => {
    const auth = useAuthStore(pinia);
    if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login');
    if (to.meta.role && auth.user.role !== to.meta.role) return next('/profile');
    next();
});


export default router
