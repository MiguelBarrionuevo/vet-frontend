import api from './api';

const citaServicioService = {
  // Obtener servicios por cita
  getServiciosByCita: async (citaId) => {
    try {
      const response = await api.get(`/api/cita-servicios/cita/${citaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener servicios de la cita con ID ${citaId}:`, error);
      throw error;
    }
  },

  // Obtener citas por servicio
  getCitasByServicio: async (servicioId) => {
    try {
      const response = await api.get(`/api/cita-servicios/servicio/${servicioId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener citas para el servicio con ID ${servicioId}:`, error);
      throw error;
    }
  },

  // Agregar servicio a cita
  addServicioToCita: async (citaServicioData) => {
    try {
      const response = await api.post('/api/cita-servicios', citaServicioData);
      return response.data;
    } catch (error) {
      console.error('Error al agregar servicio a la cita:', error);
      throw error;
    }
  },

  // Actualizar servicio en cita
  updateServicioInCita: async (citaServicioData) => {
    try {
      const response = await api.put('/api/cita-servicios', citaServicioData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar servicio en la cita:', error);
      throw error;
    }
  },

  // Eliminar servicio de cita
  removeServicioFromCita: async (citaId, servicioId) => {
    try {
      await api.delete(`/api/cita-servicios/cita/${citaId}/servicio/${servicioId}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar servicio ${servicioId} de la cita ${citaId}:`, error);
      throw error;
    }
  },

  // Eliminar todos los servicios de una cita
  removeAllServiciosFromCita: async (citaId) => {
    try {
      await api.delete(`/api/cita-servicios/cita/${citaId}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar todos los servicios de la cita ${citaId}:`, error);
      throw error;
    }
  }
};

export default citaServicioService;
