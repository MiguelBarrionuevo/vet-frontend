import api from './api';

// Obtener todos los clientes
export const getAllClientes = async () => {
  try {
    const response = await api.get('/api/clientes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

// Obtener un cliente por ID
export const getClienteById = async (id) => {
  try {
    const response = await api.get(`/api/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cliente con ID ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo cliente
export const createCliente = async (clienteData) => {
  try {
    const response = await api.post('/api/clientes', clienteData);
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

// Actualizar un cliente existente
export const updateCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/api/clientes/${id}`, clienteData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cliente con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteCliente = async (id) => {
  try {
    await api.delete(`/api/clientes/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar cliente con ID ${id}:`, error);
    throw error;
  }
};

// No es necesario exportar por defecto ahora
// export default clientService;
