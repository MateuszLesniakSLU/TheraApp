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
    { path: '/profile', component: Profile },
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

router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/register']
    const auth = useAuthStore()
    const isLoggedIn = auth.isAuthenticated

    if (publicPages.includes(to.path) && isLoggedIn) {
        return next('/profile')
    }

    const protectedPages = ['/profile', '/admin']
    if (protectedPages.includes(to.path) && !isLoggedIn) {
        return next('/login')
    }

    next()
})

export default router
