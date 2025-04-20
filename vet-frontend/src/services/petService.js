import api from './api';

const petService = {
  // Obtener todas las mascotas
  getAllMascotas: async () => {
    try {
      const response = await api.get('/api/mascotas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mascotas:', error);
      throw error;
    }
  },

  // Obtener una mascota por ID
  getMascotaById: async (id) => {
    try {
      const response = await api.get(`/api/mascotas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mascota con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener mascotas por ID de cliente
  getMascotasByClienteId: async (clienteId) => {
    try {
      const response = await api.get(`/api/mascotas/cliente/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mascotas del cliente con ID ${clienteId}:`, error);
      throw error;
    }
  },

  // Crear una nueva mascota
  createMascota: async (mascotaData) => {
    try {
      const response = await api.post('/api/mascotas', mascotaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear mascota:', error);
      throw error;
    }
  },

  // Actualizar una mascota existente
  updateMascota: async (id, mascotaData) => {
    try {
      const response = await api.put(`/api/mascotas/${id}`, mascotaData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar mascota con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una mascota
  deleteMascota: async (id) => {
    try {
      await api.delete(`/api/mascotas/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar mascota con ID ${id}:`, error);
      throw error;
    }
  }
};

export default petService;
