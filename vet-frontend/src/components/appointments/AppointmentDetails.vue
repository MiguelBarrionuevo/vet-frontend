<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Cabecera con información de la cita -->
    <div :class="headerColorClass">
      <div class="px-6 py-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="flex items-center">
            <div class="h-16 w-16 rounded-full bg-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" :class="iconColorClass" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4 text-white">
              <h2 class="text-xl font-semibold flex items-center">
                <span :class="statusBadgeClass">{{ formatStatus(appointment.estado) }}</span>
                <span class="ml-2">Cita con {{ appointment.usuarioNombre }}</span>
              </h2>
              <p class="mt-1 text-white text-opacity-90">{{ formatDate(appointment.fecha) }} a las {{ formatTime(appointment.hora) }}</p>
            </div>
          </div>
          <div class="mt-4 md:mt-0 flex space-x-2">
            <button 
              v-if="canEdit && !isAppointmentCompleted"
              @click="$emit('edit-appointment', appointment)" 
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar Cita
            </button>
            <button 
              v-if="canCancel && isCancellable"
              @click="$emit('cancel-appointment', appointment)" 
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              Cancelar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Información principal -->
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Detalles de la cita</h3>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p class="text-sm font-medium text-gray-500">Paciente</p>
          <p class="mt-1 text-gray-900">{{ appointment.mascotaNombre }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Cliente</p>
          <p class="mt-1 text-gray-900">{{ appointment.clienteNombre }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Veterinario</p>
          <p class="mt-1 text-gray-900">{{ appointment.usuarioNombre }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Estado</p>
          <p class="mt-1">
            <span :class="statusBadgeClass">
              {{ formatStatus(appointment.estado) }}
            </span>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Motivo de la consulta -->
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Motivo de la consulta</h3>
      <p class="text-gray-700 whitespace-pre-line">{{ appointment.motivo || 'No se ha especificado un motivo para esta cita.' }}</p>
    </div>
    
    <!-- Servicios médicos asociados -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Servicios Médicos</h3>
        <button 
          v-if="canEdit && !isAppointmentCompleted"
          @click="$emit('add-services')" 
          class="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm flex items-center hover:bg-teal-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Agregar Servicios
        </button>
      </div>
      <AppointmentServices 
        :citaId="appointment.id" 
        :isReadOnly="isAppointmentCompleted || !canEdit"
        @update:services="updateServices"
      />
    </div>
    
    <!-- Acciones adicionales -->
    <div class="p-6 flex justify-between">
      <button 
        @click="$emit('back')" 
        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver a la lista
      </button>
      
      <div class="space-x-2">
        <button 
          v-if="canMarksAsCompleted"
          @click="$emit('complete-appointment', appointment)" 
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Marcar como completada
        </button>
        
        <button 
          v-if="canDelete"
          @click="confirmDelete" 
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Eliminar Cita
        </button>
      </div>
    </div>
    
    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="mb-4 text-gray-600">
          ¿Estás seguro de que deseas eliminar la cita del {{ formatDate(appointment.fecha) }} a las {{ formatTime(appointment.hora) }}?
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import AppointmentServices from './AppointmentServices.vue';

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  'back', 
  'edit-appointment', 
  'cancel-appointment', 
  'delete-appointment', 
  'complete-appointment',
  'add-services'
]);

const authStore = useAuthStore();
const showDeleteModal = ref(false);

// Verificar permisos
const canEdit = computed(() => authStore.hasPermission('CITA_UPDATE'));
const canDelete = computed(() => authStore.hasPermission('CITA_DELETE'));
const canCancel = computed(() => authStore.hasPermission('CITA_UPDATE'));

// Verificar estado de la cita
const isAppointmentCompleted = computed(() => 
  props.appointment.estado === 'COMPLETADA' || props.appointment.estado === 'CANCELADA'
);

const isCancellable = computed(() => 
  props.appointment.estado === 'PENDIENTE' || props.appointment.estado === 'CONFIRMADA'
);

const canMarksAsCompleted = computed(() => 
  props.appointment.estado === 'CONFIRMADA' && canEdit.value
);

// Clases CSS según el estado
const headerColorClass = computed(() => {
  switch (props.appointment.estado) {
    case 'PENDIENTE':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    case 'CONFIRMADA':
      return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'COMPLETADA':
      return 'bg-gradient-to-r from-green-500 to-green-600';
    case 'CANCELADA':
      return 'bg-gradient-to-r from-red-500 to-red-600';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
});

const iconColorClass = computed(() => {
  switch (props.appointment.estado) {
    case 'PENDIENTE':
      return 'text-yellow-600';
    case 'CONFIRMADA':
      return 'text-blue-600';
    case 'COMPLETADA':
      return 'text-green-600';
    case 'CANCELADA':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
});

const statusBadgeClass = computed(() => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  
  switch (props.appointment.estado) {
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
});

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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

// Confirmar eliminación
const confirmDelete = () => {
  showDeleteModal.value = true;
};

// Eliminar cita
const deleteAppointment = () => {
  emit('delete-appointment', props.appointment);
  showDeleteModal.value = false;
};

// Manejar actualización de servicios
const updateServices = (services) => {
  // Puedes utilizar esta función para realizar acciones adicionales cuando 
  // los servicios de la cita sean actualizados
  console.log('Servicios actualizados:', services);
};
</script>
