<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">
      {{ cliente.id ? 'Editar Cliente' : 'Nuevo Cliente' }}
    </h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            id="nombre"
            v-model="formData.nombre"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. Juan"
          />
          <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
        </div>
        
        <!-- Apellido -->
        <div>
          <label for="apellido" class="block text-sm font-medium text-gray-700">Apellido *</label>
          <input
            type="text"
            id="apellido"
            v-model="formData.apellido"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. Pérez"
          />
          <p v-if="errors.apellido" class="mt-1 text-sm text-red-600">{{ errors.apellido }}</p>
        </div>
        
        <!-- Correo -->
        <div>
          <label for="correo" class="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            id="correo"
            v-model="formData.correo"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. cliente@ejemplo.com"
          />
          <p v-if="errors.correo" class="mt-1 text-sm text-red-600">{{ errors.correo }}</p>
        </div>
        
        <!-- Teléfono -->
        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono *</label>
          <input
            type="tel"
            id="telefono"
            v-model="formData.telefono"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. 555-123-4567"
          />
          <p v-if="errors.telefono" class="mt-1 text-sm text-red-600">{{ errors.telefono }}</p>
        </div>
        
        <!-- Dirección -->
        <div class="md:col-span-2">
          <label for="direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            id="direccion"
            v-model="formData.direccion"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. Calle Principal #123"
          />
          <p v-if="errors.direccion" class="mt-1 text-sm text-red-600">{{ errors.direccion }}</p>
        </div>
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
          {{ cliente.id ? 'Actualizar Cliente' : 'Crear Cliente' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  cliente: {
    type: Object,
    default: () => ({})
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = reactive({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  direccion: '',
  fechaRegistro: null
});

const errors = reactive({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  direccion: ''
});

// Cargar datos si se está editando un cliente existente
onMounted(() => {
  if (props.cliente.id) {
    formData.nombre = props.cliente.nombre || '';
    formData.apellido = props.cliente.apellido || '';
    formData.correo = props.cliente.correo || '';
    formData.telefono = props.cliente.telefono || '';
    formData.direccion = props.cliente.direccion || '';
    formData.fechaRegistro = props.cliente.fechaRegistro || null;
  }
});

// Validar formulario
const validateForm = () => {
  let isValid = true;
  
  // Reiniciar errores
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validar nombre
  if (!formData.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
    isValid = false;
  }
  
  // Validar apellido
  if (!formData.apellido.trim()) {
    errors.apellido = 'El apellido es obligatorio';
    isValid = false;
  }
  
  // Validar correo si está presente
  if (formData.correo && !isValidEmail(formData.correo)) {
    errors.correo = 'Ingresa un correo válido';
    isValid = false;
  }
  
  // Validar teléfono
  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
    isValid = false;
  }
  
  return isValid;
};

// Validar formato de email
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Manejar envío del formulario
const handleSubmit = () => {
  if (validateForm()) {
    // Si es creación, establecer fecha de registro
    if (!formData.fechaRegistro) {
      formData.fechaRegistro = new Date().toISOString();
    }
    
    emit('submit', {
      ...formData,
      id: props.cliente.id // Incluir ID si existe (edición)
    });
  }
};
</script>
