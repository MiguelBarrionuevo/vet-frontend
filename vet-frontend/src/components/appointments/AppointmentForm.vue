<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">
      {{ appointment.id ? 'Editar Cita' : 'Nueva Cita' }}
    </h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Fecha -->
        <div>
          <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha *</label>
          <input
            type="date"
            id="fecha"
            v-model="formData.fecha"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            :min="minDate"
          />
          <p v-if="errors.fecha" class="mt-1 text-sm text-red-600">{{ errors.fecha }}</p>
        </div>
        
        <!-- Hora -->
        <div>
          <label for="hora" class="block text-sm font-medium text-gray-700">Hora *</label>
          <input
            type="time"
            id="hora"
            v-model="formData.horaString"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
          <p v-if="errors.hora" class="mt-1 text-sm text-red-600">{{ errors.hora }}</p>
        </div>
        
        <!-- Cliente -->
        <div>
          <label for="clienteId" class="block text-sm font-medium text-gray-700">Cliente *</label>
          <select
            id="clienteId"
            v-model="formData.clienteId"
            @change="loadClientPets"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="" disabled>Selecciona un cliente</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }} {{ cliente.apellido }}
            </option>
          </select>
          <p v-if="errors.clienteId" class="mt-1 text-sm text-red-600">{{ errors.clienteId }}</p>
        </div>
        
        <!-- Mascota -->
        <div>
          <label for="mascotaId" class="block text-sm font-medium text-gray-700">Mascota *</label>
          <div class="flex space-x-2">
            <select
              id="mascotaId"
              v-model="formData.mascotaId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              :disabled="!formData.clienteId || loadingPets"
            >
              <option value="" disabled>{{ loadingPets ? 'Cargando mascotas...' : 'Selecciona una mascota' }}</option>
              <option v-for="mascota in mascotasCliente" :key="mascota.id" :value="mascota.id">
                {{ mascota.nombre }} ({{ mascota.especie }})
              </option>
            </select>
          </div>
          <p v-if="errors.mascotaId" class="mt-1 text-sm text-red-600">{{ errors.mascotaId }}</p>
        </div>
        
        <!-- Veterinario -->
        <div>
          <label for="usuarioId" class="block text-sm font-medium text-gray-700">Veterinario *</label>
          <select
            id="usuarioId"
            v-model="formData.usuarioId"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="" disabled>Selecciona un veterinario</option>
            <option v-for="vet in veterinarios" :key="vet.id" :value="vet.id">
              {{ vet.nombreUsuario }}{{ vet.especialidad ? ` (${vet.especialidad})` : '' }}
            </option>
          </select>
          <p v-if="errors.usuarioId" class="mt-1 text-sm text-red-600">{{ errors.usuarioId }}</p>
        </div>
        
        <!-- Estado -->
        <div v-if="appointment.id">
          <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
          <select
            id="estado"
            v-model="formData.estado"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        
        <!-- Motivo -->
        <div class="md:col-span-2">
          <label for="motivo" class="block text-sm font-medium text-gray-700">Motivo de la cita *</label>
          <textarea
            id="motivo"
            v-model="formData.motivo"
            rows="3"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Describe el motivo de la consulta..."
          ></textarea>
          <p v-if="errors.motivo" class="mt-1 text-sm text-red-600">{{ errors.motivo }}</p>
        </div>
      </div>

      <!-- Mensaje para servicios en nueva cita -->
      <div v-if="!appointment.id" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-blue-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Los servicios se podrán agregar después de crear la cita.
        </p>
      </div>

      <!-- Servicios (solo visible cuando se edita una cita existente) -->
      <div v-if="appointment.id" class="mt-6">
        <AppointmentServices 
          :citaId="appointment.id" 
          :isReadOnly="formData.estado === 'COMPLETADA' || formData.estado === 'CANCELADA'"
          @update:services="updateServices"
        />
      </div>
      
      <!-- Botones -->
      <div class="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 inline-flex items-center"
        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ appointment.id ? 'Actualizar Cita' : 'Crear Cita' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted, watch } from 'vue';
import { petService } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import AppointmentServices from './AppointmentServices.vue';

const props = defineProps({
  appointment: {
    type: Object,
    default: () => ({})
  },
  clientes: {
    type: Array,
    default: () => []
  },
  veterinarios: {
    type: Array,
    default: () => []
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);
const authStore = useAuthStore();

// Estado para las mascotas del cliente seleccionado
const mascotasCliente = ref([]);
const loadingPets = ref(false);

// Manejar hora en formato adecuado
const horaToString = (hora) => {
  if (!hora) return '';
  if (typeof hora === 'string') return hora;
  
  const hour = hora.hour?.toString().padStart(2, '0') || '00';
  const minute = hora.minute?.toString().padStart(2, '0') || '00';
  
  return `${hour}:${minute}`;
};

const stringToHora = (timeString) => {
  if (!timeString) return null;
  
  const [hour, minute] = timeString.split(':').map(Number);
  
  return {
    hour,
    minute,
    second: 0,
    nano: 0
  };
};

// Datos del formulario
const formData = reactive({
  fecha: '',
  horaString: '', // Para facilitar la manipulación en la UI
  motivo: '',
  estado: 'PENDIENTE',
  mascotaId: '',
  mascotaNombre: '',
  usuarioId: '',
  usuarioNombre: '',
  clienteId: '',
  clienteNombre: ''
});

const errors = reactive({
  fecha: '',
  hora: '',
  motivo: '',
  mascotaId: '',
  usuarioId: '',
  clienteId: ''
});

// Fecha mínima permitida (hoy)
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Cargar datos si se está editando una cita existente
onMounted(async () => {
  if (props.appointment.id) {
    formData.fecha = props.appointment.fecha || '';
    formData.horaString = horaToString(props.appointment.hora) || '';
    formData.motivo = props.appointment.motivo || '';
    formData.estado = props.appointment.estado || 'PENDIENTE';
    formData.mascotaId = props.appointment.mascotaId || '';
    formData.usuarioId = props.appointment.usuarioId || '';
    formData.clienteId = props.appointment.clienteId || '';
    
    // Si hay un cliente seleccionado, cargar sus mascotas
    if (formData.clienteId) {
      await loadClientPets();
    }
  }
});

// Cargar mascotas cuando se selecciona un cliente
const loadClientPets = async () => {
  if (!formData.clienteId) {
    mascotasCliente.value = [];
    formData.mascotaId = '';
    return;
  }
  
  loadingPets.value = true;
  
  try {
    // Corregimos la forma de acceder a la respuesta
    const response = await petService.getMascotasByClienteId(formData.clienteId);
    mascotasCliente.value = Array.isArray(response.data) ? response.data : response;
    
    // Si no hay mascota seleccionada y hay mascotas disponibles, seleccionar la primera
    if (!formData.mascotaId && mascotasCliente.value.length > 0) {
      formData.mascotaId = mascotasCliente.value[0].id;
    }
  } catch (error) {
    console.error('Error al cargar mascotas del cliente:', error);
    // Mostrar un error al usuario
  } finally {
    loadingPets.value = false;
  }
};

// Validar formulario
const validateForm = () => {
  let isValid = true;
  
  // Reiniciar errores
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validar fecha
  if (!formData.fecha) {
    errors.fecha = 'La fecha es obligatoria';
    isValid = false;
  } else {
    // Verificar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.fecha = 'La fecha no puede ser en el pasado';
      isValid = false;
    }
  }
  
  // Validar hora
  if (!formData.horaString) {
    errors.hora = 'La hora es obligatoria';
    isValid = false;
  }
  
  // Validar cliente
  if (!formData.clienteId) {
    errors.clienteId = 'Debes seleccionar un cliente';
    isValid = false;
  }
  
  // Validar mascota
  if (!formData.mascotaId) {
    errors.mascotaId = 'Debes seleccionar una mascota';
    isValid = false;
  }
  
  // Validar veterinario
  if (!formData.usuarioId) {
    errors.usuarioId = 'Debes seleccionar un veterinario';
    isValid = false;
  }
  
  // Validar motivo
  if (!formData.motivo.trim()) {
    errors.motivo = 'El motivo de la cita es obligatorio';
    isValid = false;
  }
  
  return isValid;
};

// Manejar envío del formulario
const handleSubmit = () => {
  if (validateForm()) {
    // Construir objeto de cita para enviar al servidor
    const appointmentData = {
      id: props.appointment.id,
      fecha: formData.fecha,
      // Usar directamente el string de hora para que appointmentService lo maneje
      horaString: formData.horaString,
      motivo: formData.motivo,
      estado: formData.estado || 'PENDIENTE',
      mascotaId: formData.mascotaId,
      usuarioId: formData.usuarioId,
      clienteId: formData.clienteId
    };
    
    // Encontrar nombres para presentación
    if (props.clientes && formData.clienteId) {
      const selectedCliente = props.clientes.find(c => c.id === formData.clienteId);
      if (selectedCliente) {
        appointmentData.clienteNombre = `${selectedCliente.nombre} ${selectedCliente.apellido}`.trim();
      }
    }
    
    if (mascotasCliente.value.length && formData.mascotaId) {
      const selectedMascota = mascotasCliente.value.find(m => m.id === formData.mascotaId);
      if (selectedMascota) {
        appointmentData.mascotaNombre = selectedMascota.nombre;
      }
    }
    
    if (props.veterinarios && formData.usuarioId) {
      const selectedVet = props.veterinarios.find(v => v.id === formData.usuarioId);
      if (selectedVet) {
        appointmentData.usuarioNombre = selectedVet.nombreUsuario;
      }
    }
    
    emit('submit', appointmentData);
  }
};

// Vigilar cambios en los clientes para actualizar las mascotas
watch(() => formData.clienteId, (newClientId, oldClientId) => {
  if (newClientId !== oldClientId) {
    loadClientPets();
  }
});

// Servicios asociados a la cita
const appointmentServices = ref([]);

// Manejar actualización de servicios
const updateServices = (services) => {
  appointmentServices.value = services;
};
</script>
