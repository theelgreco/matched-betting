import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            meta: {title: 'Dashboard'},
            component: () => import('@/views/DashboardView.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: {name: 'dashboard'}
        }
    ],
})

router.beforeEach((to) => {
    document.title = `Matched Betting | ${to.meta.title}`
})

export default router
