<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Header con buscador y filtros -->
    <div class="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-3 md:mb-0">Lista de Citas</h2>
      <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto">
        <!-- Filtro por estado -->
        <div class="relative">
          <select
            v-model="selectedStatus"
            @change="filterByStatus"
            class="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        
        <!-- Filtro de fechas -->
        <div class="relative flex items-center space-x-2">
          <div class="flex-grow">
            <label class="text-xs text-gray-600 block">Desde</label>
            <input
              type="date"
              v-model="startDate"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div class="flex-grow">
            <label class="text-xs text-gray-600 block">Hasta</label>
            <input
              type="date"
              v-model="endDate"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button 
            @click="filterByDateRange"
            class="mt-3.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            title="Buscar por rango de fechas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Botón de nueva cita -->
        <button
          v-if="hasCreatePermission"
          @click="$emit('add-appointment')"
          class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nueva Cita
        </button>
      </div>
    </div>
    
    <!-- Indicador de filtros activos -->
    <div v-if="isFiltered" class="bg-blue-50 p-2 flex justify-between items-center">
      <div class="flex items-center text-sm text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
        </svg>
        Filtros activos: {{ activeFiltersText }}
      </div>
      <button 
        @click="clearFilters" 
        class="text-blue-600 hover:text-blue-800 text-sm"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Indicador de carga -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      <span class="ml-2 text-gray-500">Cargando citas...</span>
    </div>
    
    <!-- Mensaje de error -->
    <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p class="font-medium">Error al cargar las citas</p>
      <p>{{ error }}</p>
    </div>
    
    <!-- Mensaje sin resultados -->
    <div v-else-if="appointments.length === 0" class="py-8 text-center text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p v-if="isFiltered">No se encontraron citas con los filtros aplicados</p>
      <p v-else>No hay citas programadas. ¡Agenda una nueva cita!</p>
    </div>
    
    <!-- Tabla de citas -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente/Cliente</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veterinario</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="appointment in appointments" :key="appointment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ formatDate(appointment.fecha) }}</div>
              <div class="text-sm text-gray-500">{{ formatTime(appointment.hora) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ appointment.mascotaNombre }}</div>
                  <div class="text-sm text-gray-500">{{ appointment.clienteNombre }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ appointment.usuarioNombre }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 max-w-xs truncate">{{ appointment.motivo || 'Sin especificar' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadgeClass(appointment.estado)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ formatStatus(appointment.estado) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button 
                  @click="$emit('view-appointment', appointment)" 
                  class="text-blue-600 hover:text-blue-900"
                  title="Ver detalles"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  v-if="hasUpdatePermission && !isAppointmentCompleted(appointment)"
                  @click="$emit('edit-appointment', appointment)" 
                  class="text-teal-600 hover:text-teal-900"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  v-if="hasUpdatePermission && isCancellable(appointment)"
                  @click="confirmCancel(appointment)" 
                  class="text-yellow-600 hover:text-yellow-900"
                  title="Cancelar cita"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  v-if="hasDeletePermission"
                  @click="confirmDelete(appointment)" 
                  class="text-red-600 hover:text-red-900"
                  title="Eliminar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
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
          ¿Estás seguro de que deseas eliminar la cita del {{ formatDate(appointmentToDelete?.fecha) }} a las {{ formatTime(appointmentToDelete?.hora) }}?
          <br><span class="text-red-600 text-sm">Esta acción no se puede deshacer.</span>
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="deleteAppointment" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación de cancelación -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar cancelación de cita</h3>
        <p class="mb-4 text-gray-600">
          ¿Estás seguro de que deseas cancelar la cita del {{ formatDate(appointmentToCancel?.fecha) }} a las {{ formatTime(appointmentToCancel?.hora) }}?
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showCancelModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            No cancelar
          </button>
          <button @click="cancelAppointment" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Sí, cancelar cita
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  appointments: {
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

const emit = defineEmits([
  'add-appointment', 
  'edit-appointment', 
  'delete-appointment', 
  'view-appointment', 
  'cancel-appointment',
  'filter-status',
  'filter-date-range',
  'clear-filters'
]);

const authStore = useAuthStore();

// Permisos para acciones
const hasCreatePermission = computed(() => authStore.hasPermission('CITA_CREATE'));
const hasUpdatePermission = computed(() => authStore.hasPermission('CITA_UPDATE'));
const hasDeletePermission = computed(() => authStore.hasPermission('CITA_DELETE'));

// Estado para filtros
const selectedStatus = ref('');
const startDate = ref('');
const endDate = ref('');
const showDeleteModal = ref(false);
const showCancelModal = ref(false);
const appointmentToDelete = ref(null);
const appointmentToCancel = ref(null);

// Verificar si hay filtros activos
const isFiltered = computed(() => {
  return selectedStatus.value !== '' || startDate.value !== '' || endDate.value !== '';
});

// Texto que muestra los filtros activos
const activeFiltersText = computed(() => {
  const filters = [];
  
  if (selectedStatus.value) {
    filters.push(`Estado: ${formatStatus(selectedStatus.value)}`);
  }
  
  if (startDate.value && endDate.value) {
    filters.push(`Fechas: del ${formatDate(startDate.value)} al ${formatDate(endDate.value)}`);
  } else if (startDate.value) {
    filters.push(`Desde: ${formatDate(startDate.value)}`);
  } else if (endDate.value) {
    filters.push(`Hasta: ${formatDate(endDate.value)}`);
  }
  
  return filters.join(', ');
});

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Formatear hora
const formatTime = (time) => {
  if (!time) return '';
  
  // Si es un objeto con propiedades hour y minute
  if (time.hour !== undefined && time.minute !== undefined) {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }
  
  // Si es un string en formato HH:MM
  return time;
};

// Formatear estado
const formatStatus = (status) => {
  if (!status) return 'Desconocido';
  
  const statusMap = {
    'PENDIENTE': 'Pendiente',
    'CONFIRMADA': 'Confirmada',
    'COMPLETADA': 'Completada',
    'CANCELADA': 'Cancelada'
  };
  
  return statusMap[status] || status;
};

// Obtener clases CSS para el badge de estado
const getStatusBadgeClass = (status) => {
  const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  
  switch (status) {
    case 'PENDIENTE':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'CONFIRMADA':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'COMPLETADA':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'CANCELADA':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// Verificar si una cita está completada
const isAppointmentCompleted = (appointment) => {
  return appointment.estado === 'COMPLETADA' || appointment.estado === 'CANCELADA';
};

// Verificar si una cita se puede cancelar
const isCancellable = (appointment) => {
  return appointment.estado === 'PENDIENTE' || appointment.estado === 'CONFIRMADA';
};

// Filtrar por estado
const filterByStatus = () => {
  emit('filter-status', selectedStatus.value);
};

// Filtrar por rango de fechas
const filterByDateRange = () => {
  if (startDate.value || endDate.value) {
    emit('filter-date-range', { startDate: startDate.value, endDate: endDate.value });
  }
};

// Limpiar todos los filtros
const clearFilters = () => {
  selectedStatus.value = '';
  startDate.value = '';
  endDate.value = '';
  
  emit('clear-filters');
};

// Confirmar eliminación
const confirmDelete = (appointment) => {
  appointmentToDelete.value = appointment;
  showDeleteModal.value = true;
};

// Eliminar cita
const deleteAppointment = () => {
  emit('delete-appointment', appointmentToDelete.value);
  showDeleteModal.value = false;
  appointmentToDelete.value = null;
};

// Confirmar cancelación
const confirmCancel = (appointment) => {
  appointmentToCancel.value = appointment;
  showCancelModal.value = true;
};

// Cancelar cita
const cancelAppointment = () => {
  emit('cancel-appointment', appointmentToCancel.value);
  showCancelModal.value = false;
  appointmentToCancel.value = null;
};
</script>
