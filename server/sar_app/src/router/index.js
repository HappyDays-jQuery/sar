import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

//Vue.component('r-link', r_link)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../components/Home.vue'),
            meta: {name: 'Home', icon: 'info'}
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
})
