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
            component: () => import('../components/HelloWorld.vue'),
            meta: {name: 'Home', icon: 'info'}
        },
        {path: '*', component: () => import('../components/NotFoundComponent.vue')}
    ],
})
