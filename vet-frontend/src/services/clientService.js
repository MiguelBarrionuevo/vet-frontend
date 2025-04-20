import api from './api';

const clientService = {
  // Obtener todos los clientes
  getAllClientes: async () => {
    try {
      const response = await api.get('/api/clientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  getClienteById: async (id) => {
    try {
      const response = await api.get(`/api/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  createCliente: async (clienteData) => {
    try {
      const response = await api.post('/api/clientes', clienteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Actualizar un cliente existente
  updateCliente: async (id, clienteData) => {
    try {
      const response = await api.put(`/api/clientes/${id}`, clienteData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un cliente
  deleteCliente: async (id) => {
    try {
      await api.delete(`/api/clientes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error);
      throw error;
    }
  }
};

export default clientService;
