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
    meta: { requiresAuth: true, requiresPerm: 'USUARIO_CREATE' } // Requiere autenticación y permiso de creación de usuario
  },
  {
    path: '/users',
    name: 'UserList',
    component: UserList,
    meta: { requiresAuth: true, requiresPerm: 'USUARIO_READ' } // Requiere autenticación y permiso de lectura de usuario
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
  const hasPermission = authStore.hasPermission; // Obtener el estado de permisos
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresPerm = to.matched.some(record => record.meta.requiresPerm); // Verificar si requiere permisos
  const requiredPerms = to.matched
    .filter(record => record.meta.requiresPerm)
    .map(record => record.meta.requiresPerm);

  if (requiresAuth && !isAuthenticated) {
    // Si requiere autenticación y no está autenticado, redirigir a login
    next('/login');
  } else if (requiresPerm && !requiredPerms.some(p => hasPermission(p))) {
    // Si requiere permisos y no los tiene, redirigir a dashboard o mostrar error
    console.warn('Acceso denegado: Permisos insuficientes.');
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
