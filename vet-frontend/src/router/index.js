import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
// Importar los nuevos componentes
import UserRegistration from '../components/UserRegistration.vue';
import UserList from '../components/UserList.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  // Nuevas rutas para gestión de usuarios
  {
    path: '/users/register',
    name: 'UserRegistration',
    component: UserRegistration,
    meta: { requiresAuth: true, requiresAdmin: true } // Requiere autenticación y rol de admin
  },
  {
    path: '/users',
    name: 'UserList',
    component: UserList,
    meta: { requiresAuth: true, requiresAdmin: true } // Requiere autenticación y rol de admin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación actualizada
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin; // Obtener el estado de admin
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin); // Verificar si requiere admin

  if (requiresAuth && !isAuthenticated) {
    // Si requiere autenticación y no está autenticado, redirigir a login
    next('/login');
  } else if (requiresAdmin && !isAdmin) {
    // Si requiere rol de admin y no lo tiene, redirigir a dashboard o mostrar error
    console.warn('Acceso denegado: Se requiere rol de administrador.');
    next('/dashboard'); // O redirigir a una página de 'acceso denegado'
  } else if (to.path === '/login' && isAuthenticated) {
    // Si intenta ir a login estando autenticado, redirigir a dashboard
    next('/dashboard');
  } else {
    // En cualquier otro caso, permitir la navegación
    next();
  }
});

export default router;
