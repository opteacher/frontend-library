import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/VwHome.vue'
import ColorSelect from '../views/VwColorSelect.vue'
import UploadFile from '../views/VwUploadFile.vue'

const router = createRouter({
  history: createWebHistory('frontend-library'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/color-select',
      name: 'ColorSelect',
      component: ColorSelect
    },
    {
      path: '/upload-file',
      name: 'UploadFile',
      component: UploadFile
    }
  ]
})

export default router
