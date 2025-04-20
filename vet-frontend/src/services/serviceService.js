import api from './api';

const serviceService = {
  // Obtener todos los servicios
  getAllServices: async () => {
    try {
      const response = await api.get('/api/servicios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error;
    }
  },

  // Obtener un servicio por ID
  getServiceById: async (id) => {
    try {
      const response = await api.get(`/api/servicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener servicios veterinarios
  getVeterinaryServices: async () => {
    try {
      const response = await api.get('/api/servicios/veterinarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicios veterinarios:', error);
      throw error;
    }
  },

  // Buscar servicios por precio máximo
  getServicesByMaxPrice: async (precio) => {
    try {
      const response = await api.get(`/api/servicios/precio/hasta/${precio}`);
      return response.data;
    } catch (error) {
      console.error(`Error al buscar servicios con precio máximo ${precio}:`, error);
      throw error;
    }
  },

  // Buscar servicios por precio mínimo
  getServicesByMinPrice: async (precio) => {
    try {
      const response = await api.get(`/api/servicios/precio/desde/${precio}`);
      return response.data;
    } catch (error) {
      console.error(`Error al buscar servicios con precio mínimo ${precio}:`, error);
      throw error;
    }
  },

  // Buscar servicios por nombre
  searchServicesByName: async (nombre) => {
    try {
      const response = await api.get('/api/servicios/buscar', {
        params: { nombre }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al buscar servicios con nombre "${nombre}":`, error);
      throw error;
    }
  },

  // Crear un nuevo servicio
  createService: async (serviceData) => {
    try {
      const response = await api.post('/api/servicios', serviceData);
      return response.data;
    } catch (error) {
      console.error('Error al crear servicio:', error);
      throw error;
    }
  },

  // Actualizar un servicio existente
  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`/api/servicios/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar servicio con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un servicio
  deleteService: async (id) => {
    try {
      await api.delete(`/api/servicios/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar servicio con ID ${id}:`, error);
      throw error;
    }
  }
};

export default serviceService;
