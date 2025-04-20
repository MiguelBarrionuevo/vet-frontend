import api from './api';

// Función helper para convertir un string de hora "HH:MM" a formato ISO-8601 para LocalTime
function formatTimeToISO(timeString) {
  if (!timeString) return '';
  
  // Si ya es una cadena ISO (por ejemplo, "10:30:00"), devolverla
  if (timeString.includes('T') || timeString.includes('Z')) {
    return timeString;
  }
  
  // Convertir "HH:MM" a "HH:MM:00"
  let formattedTime = timeString;
  if (formattedTime.split(':').length === 2) {
    formattedTime += ':00';
  }
  
  return formattedTime;
}

const appointmentService = {
  // Obtener todas las citas
  getAllCitas: async () => {
    try {
      const response = await api.get('/api/citas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  // Obtener una cita por ID
  getCitaById: async (id) => {
    try {
      const response = await api.get(`/api/citas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener cita con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener citas por veterinario
  getCitasByVeterinario: async (veterinarioId) => {
    try {
      const response = await api.get(`/api/citas/veterinario/${veterinarioId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener citas del veterinario con ID ${veterinarioId}:`, error);
      throw error;
    }
  },

  // Obtener próximas citas
  getProximasCitas: async () => {
    try {
      const response = await api.get('/api/citas/proximas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener próximas citas:', error);
      throw error;
    }
  },

  // Obtener citas por mascota
  getCitasByMascota: async (mascotaId) => {
    try {
      const response = await api.get(`/api/citas/mascota/${mascotaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener citas de la mascota con ID ${mascotaId}:`, error);
      throw error;
    }
  },

  // Obtener citas por rango de fechas
  getCitasByFechaRange: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get('/api/citas/fecha', {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener citas por rango de fechas:`, error);
      throw error;
    }
  },

  // Obtener citas por estado
  getCitasByEstado: async (estado) => {
    try {
      const response = await api.get(`/api/citas/estado/${estado}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener citas con estado ${estado}:`, error);
      throw error;
    }
  },

  // Obtener citas por cliente
  getCitasByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/api/citas/cliente/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener citas del cliente con ID ${clienteId}:`, error);
      throw error;
    }
  },

  // Crear una nueva cita
  createCita: async (citaData) => {
    try {
      // Lo importante es que la hora sea enviada como un string en formato HH:MM:SS
      // El backend lo deserializará automáticamente a LocalTime
      
      // Preparar los datos para enviar al servidor
      const formattedData = {
        ...citaData,
        // Convertir la hora a formato ISO para LocalTime
        hora: formatTimeToISO(citaData.horaString || citaData.hora),
        // Asegurar que los IDs sean números
        mascotaId: Number(citaData.mascotaId),
        usuarioId: Number(citaData.usuarioId),
        clienteId: Number(citaData.clienteId),
        // Establecer estado por defecto si no está presente
        estado: citaData.estado || 'PENDIENTE'
      };
      
      // Eliminar campos que no debe recibir el backend
      delete formattedData.horaString;
      
      console.log('Datos formateados para enviar al backend:', formattedData);
      
      const response = await api.post('/api/citas', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      if (error.response && error.response.data) {
        console.error('Detalle de error del servidor:', error.response.data);
      }
      throw error;
    }
  },

  // Actualizar una cita existente
  updateCita: async (id, citaData) => {
    try {
      // Preparar los datos para enviar al servidor
      const formattedData = {
        ...citaData,
        // Convertir la hora a formato ISO para LocalTime
        hora: formatTimeToISO(citaData.horaString || citaData.hora),
        // Asegurar que los IDs sean números
        mascotaId: Number(citaData.mascotaId),
        usuarioId: Number(citaData.usuarioId),
        clienteId: Number(citaData.clienteId)
      };
      
      // Eliminar campos que no debe recibir el backend
      delete formattedData.horaString;
      
      const response = await api.put(`/api/citas/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar cita con ID ${id}:`, error);
      if (error.response && error.response.data) {
        console.error('Detalle de error del servidor:', error.response.data);
      }
      throw error;
    }
  },

  // Eliminar una cita
  deleteCita: async (id) => {
    try {
      await api.delete(`/api/citas/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar cita con ID ${id}:`, error);
      throw error;
    }
  }
};

export default appointmentService;
