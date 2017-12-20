import Vue from 'vue'
import Router from 'vue-router'
import dragTree from '@/components/dragTree'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dragTree',
      component: dragTree
    }
  ]
})
