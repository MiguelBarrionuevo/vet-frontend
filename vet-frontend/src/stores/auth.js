import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);

  // Propiedad computada para verificar si es admin (ajustada para la nueva estructura de roles)
  const isAdmin = computed(() => {
    if (!user.value?.roles || user.value.roles.length === 0) {
      return false;
    }
    // Verificar tanto roles como strings u objetos
    return user.value.roles.some(role =>
      (typeof role === 'string' && role === 'ROLE_ADMIN') ||
      (typeof role === 'object' && role !== null && role.authority === 'ROLE_ADMIN')
    );
  });

  async function login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);

      // Imprimir la respuesta completa para depuración
      console.log('Respuesta completa:', response);

      // Usar directamente response.data ya que esa es la estructura
      const authData = response.data;

      // Verificar que tengamos al menos un token
      if (!authData || !authData.token) {
        console.error('Token no encontrado en la respuesta:', authData);
        throw new Error('Token no encontrado en la respuesta');
      }

      token.value = authData.token;

      // Extraer los nombres de los roles del array de objetos
      const roleNames = authData.roles?.map(role => role.authority) || [];

      user.value = {
        nombreUsuario: authData.nombreUsuario || credentials.nombreUsuario,
        // Guardar solo los nombres de los roles (strings)
        roles: roleNames,
        // Almacenar el rol principal por id para futuras referencias
        rolId: authData.rolId
      };

      localStorage.setItem('token', authData.token);
      // Guardar el objeto user simplificado con solo los nombres de roles
      localStorage.setItem('user', JSON.stringify(user.value));

      // Configurar el token para las próximas solicitudes
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      // Opcional: Manejar passwordChangeRequired si es necesario
      if (authData.passwordChangeRequired) {
        console.warn('El usuario debe cambiar su contraseña.');
        // Podrías redirigir a una página de cambio de contraseña aquí
      }

      return authData; // Devolver la respuesta completa por si se necesita algo más
    } catch (error) {
      console.error('Error de login:', error);
      console.error('Detalles de la respuesta:', error.response?.data);
      throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  }

  // Nueva función para verificar permisos
  const hasPermission = (permission) => {
    return !!user.value?.roles?.includes(permission);
  };

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }

  // Si ya hay un token, configurarlo para las solicitudes
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    hasPermission,  // Exportar la nueva función
    login,
    logout
  };
});
