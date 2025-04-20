import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const roleService = {
  // Obtener todos los roles
  getAllRoles() {
    const authStore = useAuthStore();
    return axios.get(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Obtener un rol específico
  getRoleById(id) {
    const authStore = useAuthStore();
    return axios.get(`${API_URL}/roles/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Obtener permisos de un rol
  getRolePermissions(id) {
    const authStore = useAuthStore();
    console.log(`Solicitando permisos para rol ${id}`);
    
    return axios.get(`${API_URL}/roles/${id}/permissions`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    .then(response => {
      console.log(`Respuesta para rol ${id}:`, response.data);
      return response;
    })
    .catch(error => {
      console.error(`Error al obtener permisos del rol ${id}:`, error);
      
      // Opcionalmente, recuperarse devolviendo un array vacío
      if (error.response && error.response.status === 404) {
        console.warn(`El rol ${id} no tiene permisos o no existe`);
        return { data: [] };
      }
      
      throw error;
    });
  },

  // Crear un nuevo rol
  createRole(roleData) {
    const authStore = useAuthStore();
    return axios.post(`${API_URL}/roles`, roleData, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Actualizar un rol
  updateRole(id, roleData) {
    const authStore = useAuthStore();
    return axios.put(`${API_URL}/roles/${id}`, roleData, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Eliminar un rol
  deleteRole(id) {
    const authStore = useAuthStore();
    return axios.delete(`${API_URL}/roles/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Actualizar todos los permisos de un rol
  updateRolePermissions(roleId, permissionIds) {
    const authStore = useAuthStore();
    return axios.put(`${API_URL}/roles/${roleId}/permissions`, permissionIds, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Asignar un permiso específico a un rol
  assignPermissionToRole(roleId, permissionId) {
    const authStore = useAuthStore();
    return axios.post(`${API_URL}/roles/${roleId}/permissions/${permissionId}`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Revocar un permiso específico de un rol
  revokePermissionFromRole(roleId, permissionId) {
    const authStore = useAuthStore();
    return axios.delete(`${API_URL}/roles/${roleId}/permissions/${permissionId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  },

  // Obtener todos los permisos del sistema
  getAllPermissions() {
    const authStore = useAuthStore();
    return axios.get(`${API_URL}/permissions`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    .then(response => {
      // Transformar la respuesta para asegurar que los datos tengan el formato esperado
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('getAllPermissions: respuesta inesperada', response.data);
        return { data: [] };
      }
      
      // Transformar la respuesta para incluir descripción si no existe
      const permissions = response.data.map(perm => {
        if (!perm) return null;
        return {
          id: perm.id,
          name: perm.name || `Permiso ${perm.id}`,
          description: perm.description || `Permiso para ${(perm.name || '').toLowerCase()}`
        };
      }).filter(Boolean); // Eliminar elementos null
      
      return { data: permissions };
    })
    .catch(error => {
      console.error('Error fetching permissions:', error);
      throw error;
    });
  }
};

export default roleService;
