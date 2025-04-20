import api from './api'; // Asegúrate de que api esté importado

// Obtener servicios por cita
export const getServiciosByCita = async (citaId) => {
  try {
    const response = await api.get(`/api/cita-servicios/cita/${citaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener servicios para la cita con ID ${citaId}:`, error);
    throw error;
  }
};

// Obtener citas por servicio
export const getCitasByServicio = async (servicioId) => {
  try {
    const response = await api.get(`/api/cita-servicios/servicio/${servicioId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener citas para el servicio con ID ${servicioId}:`, error);
    throw error;
  }
};

// Agregar servicio a cita
export const addServicioToCita = async (citaServicioData) => {
  try {
    const response = await api.post('/api/cita-servicios', citaServicioData);
    return response.data;
  } catch (error) {
    console.error('Error al agregar servicio a la cita:', error);
    throw error;
  }
};

// Actualizar servicio en cita
export const updateServicioInCita = async (citaServicioData) => {
  try {
    // Asumiendo que el endpoint PUT espera el objeto completo en el body
    // y que la clave primaria compuesta (citaId, servicioId) está en el objeto.
    // Si el endpoint es diferente (ej. /api/cita-servicios/{citaId}/{servicioId}),
    // necesitarás ajustar la URL aquí.
    const response = await api.put('/api/cita-servicios', citaServicioData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar servicio en la cita:', error);
    throw error;
  }
};

// Eliminar servicio de cita
export const removeServicioFromCita = async (citaId, servicioId) => {
  try {
    await api.delete(`/api/cita-servicios/cita/${citaId}/servicio/${servicioId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar servicio ${servicioId} de la cita ${citaId}:`, error);
    throw error;
  }
};

// Eliminar todos los servicios de una cita
export const removeAllServiciosFromCita = async (citaId) => {
  try {
    await api.delete(`/api/cita-servicios/cita/${citaId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar todos los servicios de la cita ${citaId}:`, error);
    throw error;
  }
};

// No exportar por defecto
// export default citaServicioService;
