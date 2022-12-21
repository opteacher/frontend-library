import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/VwHome.vue'
import Component from '../views/VwCompo.vue'
import FormDialog from '../views/VwFmDlg.vue'

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
    },
    {
      path: '/FormDialog',
      name: 'FormDialog',
      component: FormDialog
    }
  ]
})

export default router
