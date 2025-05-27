import axios from 'axios';
import { useAuthStore } from '../stores/auth'; // Importar para acceder al estado

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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
    // Solo cerrar sesión si es un error de autenticación (401), no de autorización (403)
    if (error.response && error.response.status === 401) {
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

// Servicio de usuarios con métodos para CRUD completo
export const userService = {
  // Obtener todos los usuarios
  getUsers: async () => {
    try {
      const response = await api.get('/api/usuarios');
      return response;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },
  
  // Obtener un usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/api/usuarios/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo usuario (registro)
  register: async (userData) => {
    try {
      // Cambiar '/api/usuarios/registro' a '/api/usuarios'
      const response = await api.post('/api/auth/registro', userData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },
  
  // Actualizar un usuario existente
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/api/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Eliminar un usuario
  deleteUser: async (id) => {
    try {
      await api.delete(`/api/usuarios/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Utilizar el nuevo endpoint para obtener veterinarios directamente
  getVeterinarios: async () => {
    try {
      // Usamos el nuevo endpoint específico para obtener usuarios con rol veterinario
      const response = await api.get('/api/usuarios/rol/VETERINARIO/usuarios');
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error al obtener veterinarios:', error);
      throw error;
    }
  },
  // Método genérico para obtener usuarios por rol
  getUsersByRol: (rolNombre) => api.get(`/api/usuarios/rol/${rolNombre}/usuarios`),
  // Obtener el rol de un usuario específico
  getUserRole: async (id) => {
    try {
      const response = await api.get(`/api/usuarios/${id}/rol`);
      return response;
    } catch (error) {
      console.error(`Error al obtener rol del usuario con ID ${id}:`, error);
      throw error;
    }
  },
  // Obtener usuarios por nombre de rol
  getUsersByRoleName: async (roleName) => {
    try {
      const response = await api.get(`/api/usuarios/rol/${roleName}/usuarios`);
      return response;
    } catch (error) {
      console.error(`Error al obtener usuarios con rol ${roleName}:`, error);
      throw error;
    }
  }
};

// Servicio para roles
export const roleService = {
  getRoles: () => api.get('/api/roles')
};

// Servicio para mascotas
export const petService = {
  getAllMascotas: () => api.get('/api/mascotas'),
  getMascotaById: (id) => api.get(`/api/mascotas/${id}`),
  getMascotasByClienteId: (clienteId) => api.get(`/api/mascotas/cliente/${clienteId}`),
  createMascota: (mascotaData) => api.post('/api/mascotas', mascotaData),
  updateMascota: (id, mascotaData) => api.put(`/api/mascotas/${id}`, mascotaData),
  deleteMascota: (id) => api.delete(`/api/mascotas/${id}`)
};

// Servicio para servicios médicos
export const medicalServiceService = {
  getAllServices: async () => { // Modificar esta función
    try {
      const response = await api.get('/api/servicios');
      return response.data; // Devolver response.data directamente
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error; // Re-lanzar el error para que el componente lo maneje
    }
  },
  getServiceById: async (id) => { // Asegurar consistencia en los demás si es necesario
    try {
      const response = await api.get(`/api/servicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  },
  getVeterinaryServices: async () => { // Asegurar consistencia
    try {
      const response = await api.get('/api/servicios/veterinarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicios veterinarios:', error);
      throw error;
    }
  },
  searchServicesByName: async (nombre) => { // Asegurar consistencia
    try {
      const response = await api.get('/api/servicios/buscar', { params: { nombre } });
      return response.data;
    } catch (error) {
      console.error(`Error al buscar servicios con nombre "${nombre}":`, error);
      throw error;
    }
  },
  getServicesByMaxPrice: async (precio) => { // Asegurar consistencia
    try {
      const response = await api.get(`/api/servicios/precio/hasta/${precio}`);
      return response.data;
    } catch (error) {
      console.error(`Error al buscar servicios con precio máximo ${precio}:`, error);
      throw error;
    }
  },
  getServicesByMinPrice: async (precio) => { // Asegurar consistencia
    try {
      const response = await api.get(`/api/servicios/precio/desde/${precio}`);
      return response.data;
    } catch (error) {
      console.error(`Error al buscar servicios con precio mínimo ${precio}:`, error);
      throw error;
    }
  },
  createService: async (serviceData) => { // Asegurar consistencia
    try {
      const response = await api.post('/api/servicios', serviceData);
      return response.data;
    } catch (error) {
      console.error('Error al crear servicio:', error);
      throw error;
    }
  },
  updateService: async (id, serviceData) => { // Asegurar consistencia
    try {
      const response = await api.put(`/api/servicios/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar servicio con ID ${id}:`, error);
      throw error;
    }
  },
  deleteService: async (id) => { // Asegurar consistencia
    try {
      // Delete no suele devolver datos, pero mantenemos la estructura por si acaso
      await api.delete(`/api/servicios/${id}`);
      return true; // O podrías devolver response.status si es relevante
    } catch (error) {
      console.error(`Error al eliminar servicio con ID ${id}:`, error);
      throw error;
    }
  }
};

export const logService = {  
  downloadLogs: () => api.get('/api/logs/download', { responseType: 'blob' }),  
  getTailLogs: (lines = 100) => api.get(`/api/logs/tail?lines=${lines}`),  
  getLogsByLevel: (level, maxLines = 500) => api.get(`/api/logs/level/${level}?maxLines=${maxLines}`)  
};


export default api;
