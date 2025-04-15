import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Ajusta esto a la URL de tu backend
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    // Si el token es inválido o ha expirado, desloguear al usuario
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Si no estamos ya en la página de login, redirigir
      if (window.location.pathname !== '/login') {
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

export default api;
