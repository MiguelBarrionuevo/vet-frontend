import axios from 'axios';
import { useAuthStore } from '../stores/auth'; // Importar para acceder al estado

const api = axios.create({
  baseURL: 'http://localhost:8080', // Ajusta esto a la URL de tu backend
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para añadir el token a cada solicitud
api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    // Si el token es inválido o ha expirado (401 Unauthorized o 403 Forbidden), desloguear
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const authStore = useAuthStore();
      // Solo desloguear si no es un error en la página de login
      if (window.location.pathname !== '/login') {
        authStore.logout(); // Usar la acción logout del store
        // Redirigir a login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Servicio para el dashboard
export const dashboardService = {
  getStats: () => api.get('/api/stats/dashboard'),
  getServicios: () => api.get('/api/servicios'),
  getProximasCitas: () => api.get('/api/citas/proximas')
};

// Servicio para usuarios
export const userService = {
  register: (userData) => api.post('/api/auth/registro', userData),
  getUsers: () => api.get('/api/usuarios'),
  // Añadir más funciones si es necesario (ej. getUserById, updateUser, deleteUser)
};

// Servicio para roles
export const roleService = {
  getRoles: () => api.get('/api/roles')
};

export default api;
