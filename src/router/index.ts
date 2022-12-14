import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/VwHome.vue'
import Component from '../views/VwCompo.vue'

const router = createRouter({
  history: createWebHistory('frontend-library'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/component',
      name: 'Component',
      component: Component
    }
  ]
})

export default router
