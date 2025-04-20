<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Header con buscador -->
    <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Lista de Clientes</h2>
      <div class="flex items-center w-full sm:w-auto">
        <div class="relative flex-grow">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Buscar por nombre, email o teléfono"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <button
          @click="$emit('add-client')"
          class="ml-3 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo
        </button>
      </div>
    </div>
    
    <!-- Indicador de carga -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      <span class="ml-2 text-gray-500">Cargando clientes...</span>
    </div>
    
    <!-- Mensaje de error -->
    <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p class="font-medium">Error al cargar los clientes</p>
      <p>{{ error }}</p>
    </div>
    
    <!-- Mensaje sin resultados -->
    <div v-else-if="filteredClients.length === 0" class="py-8 text-center text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p v-if="searchTerm">No se encontraron clientes que coincidan con "{{ searchTerm }}"</p>
      <p v-else>No hay clientes registrados. ¡Agrega uno nuevo!</p>
    </div>
    
    <!-- Tabla de clientes -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascotas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="cliente in filteredClients" :key="cliente.id" class="hover:bg-gray-50 cursor-pointer" @click="viewDetails(cliente)">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <span class="text-lg text-teal-700">{{ getInitials(cliente) }}</span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ getFullName(cliente) }}</div>
                  <div class="text-sm text-gray-500">{{ cliente.direccion || 'Sin dirección' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ cliente.correo || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ cliente.telefono || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex -space-x-2 overflow-hidden">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-medium">
                  <!-- Asegurarse de que el contador es un número y nunca devuelve NaN -->
                  {{ isNaN(cliente.cantidadMascotas) ? 0 : cliente.cantidadMascotas || 0 }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click.stop="$emit('view-client-pets', cliente)" class="text-blue-600 hover:text-blue-900 mr-3">
                Ver mascotas
              </button>
              <button @click.stop="$emit('edit-client', cliente)" class="text-teal-600 hover:text-teal-900 mr-3">
                Editar
              </button>
              <button @click.stop="confirmDelete(cliente)" class="text-red-600 hover:text-red-900">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="mb-4 text-gray-600">
          ¿Estás seguro de que deseas eliminar a <span class="font-semibold">{{ clientToDelete?.nombre }}</span>?
          <br><span class="text-red-600 text-sm">Esta acción no se puede deshacer.</span>
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="deleteClient" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';

const props = defineProps({
  clients: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['add-client', 'edit-client', 'delete-client', 'view-client', 'view-client-pets']);

const searchTerm = ref('');
const showDeleteModal = ref(false);
const clientToDelete = ref(null);

// Filtrar clientes según término de búsqueda
const filteredClients = computed(() => {
  if (!searchTerm.value) {
    return props.clients;
  }
  
  const term = searchTerm.value.toLowerCase();
  return props.clients.filter(cliente => {
    const fullName = getFullName(cliente).toLowerCase();
    return (
      fullName.includes(term) ||
      (cliente.correo && cliente.correo.toLowerCase().includes(term)) ||
      (cliente.telefono && cliente.telefono.includes(term))
    );
  });
});

// Obtener el nombre completo de un cliente
const getFullName = (cliente) => {
  if (!cliente) return '';
  return `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Sin nombre';
};

// Obtener iniciales del nombre del cliente
const getInitials = (cliente) => {
  if (!cliente) return '?';
  
  const firstInitial = cliente.nombre ? cliente.nombre.charAt(0) : '';
  const lastInitial = cliente.apellido ? cliente.apellido.charAt(0) : '';
  
  return (firstInitial + lastInitial).toUpperCase() || '?';
};

// Ver detalles del cliente
const viewDetails = (cliente) => {
  emit('view-client', cliente);
};

// Confirmar eliminación
const confirmDelete = (cliente) => {
  clientToDelete.value = cliente;
  showDeleteModal.value = true;
};

// Eliminar cliente
const deleteClient = () => {
  emit('delete-client', clientToDelete.value);
  showDeleteModal.value = false;
  clientToDelete.value = null;
};
</script>
