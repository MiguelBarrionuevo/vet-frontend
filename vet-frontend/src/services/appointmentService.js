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

// Función para procesar citas (normalizar formato)
function procesarCitas(citas) {
  if (!Array.isArray(citas)) return [];
  
  return citas.map(cita => {
    // Formatear la hora desde el formato de objeto
    let horaFormateada = '';
    if (cita.hora) {
      try {
        // Verificar si es el formato con hour, minute, second, nano
        if (cita.hora.hour !== undefined) {
          // Usar valores sensatos para la hora (evitar valores extremos)
          const hour = cita.hora.hour > 23 ? 0 : cita.hora.hour;
          const minute = cita.hora.minute > 59 ? 0 : cita.hora.minute;
          
          // Formatear como HH:MM
          horaFormateada = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        } else if (typeof cita.hora === 'string') {
          // Si es una cadena, usar directamente
          horaFormateada = cita.hora;
        }
      } catch (e) {
        console.error('Error formateando hora:', e);
      }
    }
    
    return {
      ...cita,
      // Asegurar que la hora esté en formato string para la visualización
      hora: horaFormateada,
      // Crear referencias compatibles con el formato anterior
      mascota: {
        nombre: cita.mascotaNombre || '',
        especie: cita.especie || '',
        raza: cita.raza || ''
      },
      cliente: {
        nombre: cita.clienteNombre || ''
      },
      usuario: {
        nombre: cita.usuarioNombre || ''
      }
    };
  });
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
      console.log('Solicitando próximas citas al endpoint /api/citas/proximas');
      const response = await api.get('/api/citas/proximas');
      
      // Validar que la respuesta sea un array
      if (Array.isArray(response.data)) {
        console.log('Próximas citas recibidas correctamente:', response.data);
        return procesarCitas(response.data);
      } else {
        console.error('La respuesta no es un array:', response.data);
        return [];
      }
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
      console.log(`Solicitando citas desde ${fechaInicio} hasta ${fechaFin}`);
      
      // Verificar que las fechas estén en formato correcto
      if (!fechaInicio || !fechaFin) {
        throw new Error('Fechas de inicio o fin no proporcionadas');
      }
      
      const response = await api.get('/api/citas/fecha', {
        params: { fechaInicio, fechaFin }
      });
      
      // Validar que la respuesta sea un array
      if (Array.isArray(response.data)) {
        console.log(`Recibidas ${response.data.length} citas en el rango de fechas`);
        return procesarCitas(response.data);
      } else {
        console.error('La respuesta no es un array:', response.data);
        return [];
      }
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
