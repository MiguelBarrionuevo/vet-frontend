import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  
  const isAuthenticated = computed(() => !!token.value);
  
  async function login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // Imprimir la respuesta completa para depuración
      console.log('Respuesta completa:', response);
      
      // Verificar diferentes posibles estructuras de respuesta
      let authData;
      
      if (response.data && response.data.data) {
        // Estructura original esperada: response.data.data
        authData = response.data.data;
      } else if (response.data && response.data.token) {
        // Estructura alternativa: directamente en response.data
        authData = response.data;
      } else if (response.data) {
        // Usar response.data completo como último recurso
        authData = response.data;
        console.log('Usando response.data completo:', authData);
      } else {
        throw new Error('Respuesta de login inválida');
      }
      
      // Verificar que tengamos al menos un token
      if (!authData.token) {
        console.error('Token no encontrado en la respuesta:', authData);
        throw new Error('Token no encontrado en la respuesta');
      }
      
      token.value = authData.token;
      user.value = {
        nombreUsuario: authData.nombreUsuario || credentials.nombreUsuario,
        roles: authData.roles || []
      };
      
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(user.value));
      
      // Configurar el token para las próximas solicitudes
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      return authData;
    } catch (error) {
      console.error('Error de login:', error);
      console.error('Detalles de la respuesta:', error.response?.data);
      throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  }
  
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
    login,
    logout
  };
});
