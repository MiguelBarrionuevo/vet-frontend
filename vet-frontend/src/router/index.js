import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../components/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'clients',
    component: () => import('../views/ClientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    name: 'patients',
    component: () => import('../views/PatientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointments',
    name: 'appointments',
    component: () => import('../views/AppointmentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('../views/ServicesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/billing',
    name: 'billing',
    component: () => import('../views/ServicesView.vue'), // Temporalmente usamos ServicesView
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../components/UserList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/register',
    name: 'userRegister',
    component: () => import('../components/UserRegistration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('../views/RolesManagement.vue'),
    meta: { requiresAuth: true }
  },
  {  
  path: '/logs',  
  name: 'logs',  
  component: () => import('../views/LogsManagement.vue'),  
  meta: { requiresAuth: true }  
  },
  // 404 - Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active'
});

// Protección de rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } 
  // Rutas que requieren NO estar autenticado (como login)
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } 
  else {
    next();
  }
});

export default router;
