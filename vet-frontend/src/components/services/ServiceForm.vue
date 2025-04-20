<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">
      {{ service.id ? 'Editar Servicio' : 'Nuevo Servicio' }}
    </h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Nombre -->
        <div class="md:col-span-2">
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del servicio *</label>
          <input
            type="text"
            id="nombre"
            v-model="formData.nombre"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. Consulta general"
          />
          <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
        </div>
        
        <!-- Descripción -->
        <div class="md:col-span-2">
          <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            id="descripcion"
            v-model="formData.descripcion"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Describe el servicio..."
          ></textarea>
          <p v-if="errors.descripcion" class="mt-1 text-sm text-red-600">{{ errors.descripcion }}</p>
        </div>
        
        <!-- Precio -->
        <div class="md:col-span-2">
          <label for="precio" class="block text-sm font-medium text-gray-700">Precio *</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="precio"
              v-model.number="formData.precio"
              required
              min="0"
              step="0.01"
              class="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:border-teal-500 focus:ring-teal-500"
              placeholder="0.00"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">CLP</span>
            </div>
          </div>
          <p v-if="errors.precio" class="mt-1 text-sm text-red-600">{{ errors.precio }}</p>
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
          {{ service.id ? 'Actualizar Servicio' : 'Crear Servicio' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  service: {
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
  descripcion: '',
  precio: 0
});

const errors = reactive({
  nombre: '',
  descripcion: '',
  precio: ''
});

// Cargar datos si se está editando un servicio existente
onMounted(() => {
  if (props.service.id) {
    formData.nombre = props.service.nombre || '';
    formData.descripcion = props.service.descripcion || '';
    formData.precio = props.service.precio || 0;
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
    errors.nombre = 'El nombre del servicio es obligatorio';
    isValid = false;
  } else if (formData.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    isValid = false;
  }
  
  // Validar precio
  if (formData.precio <= 0) {
    errors.precio = 'El precio debe ser mayor que cero';
    isValid = false;
  }
  
  return isValid;
};

// Manejar envío del formulario
const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', {
      ...formData,
      id: props.service.id // Incluir ID si existe (edición)
    });
  }
};
</script>
