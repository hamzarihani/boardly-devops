import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/billing',
    name: 'billing',
    component: () => import('@/views/billing-subscription/BillingSubscription.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* 🔒 ADD GUARD HERE */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  // if (to.meta.requiresAuth && !token) {
  //   return next({ name: 'login' })
  // }

  // if (to.meta.guestOnly && token) {
  //   return next({ name: 'dashboard' })
  // }

  next()
})

export default router
