<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">
      {{ mascota.id ? 'Editar Mascota' : 'Nueva Mascota' }}
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
            placeholder="Ej. Max"
          />
          <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
        </div>
        
        <!-- Especie -->
        <div>
          <label for="especie" class="block text-sm font-medium text-gray-700">Especie *</label>
          <select
            id="especie"
            v-model="formData.especie"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="" disabled>Selecciona una especie</option>
            <option v-for="especie in especies" :key="especie" :value="especie">{{ especie }}</option>
          </select>
          <p v-if="errors.especie" class="mt-1 text-sm text-red-600">{{ errors.especie }}</p>
        </div>
        
        <!-- Raza -->
        <div>
          <label for="raza" class="block text-sm font-medium text-gray-700">Raza</label>
          <input
            type="text"
            id="raza"
            v-model="formData.raza"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Ej. Labrador"
          />
        </div>
        
        <!-- Fecha de nacimiento -->
        <div>
          <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
          <input
            type="date"
            id="fechaNacimiento"
            v-model="formData.fechaNacimiento"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
        </div>
        
        <!-- Sexo (antes género) -->
        <div>
          <label for="sexo" class="block text-sm font-medium text-gray-700">Sexo</label>
          <select
            id="sexo"
            v-model="formData.sexo"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="" disabled>Selecciona un sexo</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>
        
        <!-- Cliente ID (si está editando y no viene con cliente preseleccionado) -->
        <div v-if="!clientePreseleccionado && !formData.clienteId">
          <label for="clienteId" class="block text-sm font-medium text-gray-700">Cliente *</label>
          <select
            id="clienteId"
            v-model="formData.clienteId"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="" disabled>Selecciona un cliente</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ getClienteFullName(cliente) }}
            </option>
          </select>
          <p v-if="errors.clienteId" class="mt-1 text-sm text-red-600">{{ errors.clienteId }}</p>
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
          {{ mascota.id ? 'Actualizar Mascota' : 'Crear Mascota' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  mascota: {
    type: Object,
    default: () => ({})
  },
  clientePreseleccionado: {
    type: Object,
    default: null
  },
  clientes: {
    type: Array,
    default: () => []
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Lista de especies disponibles
const especies = [
  'Perro',
  'Gato',
  'Ave',
  'Conejo',
  'Reptil',
  'Pez',
  'Hurón',
  'Hamster',
  'Otro'
];

const formData = reactive({
  nombre: '',
  especie: '',
  raza: '',
  fechaNacimiento: '',
  sexo: '',
  clienteId: props.clientePreseleccionado?.id || ''
});

const errors = reactive({
  nombre: '',
  especie: '',
  clienteId: ''
});

// Obtener nombre completo del cliente
const getClienteFullName = (cliente) => {
  if (!cliente) return 'Cliente desconocido';
  return `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
};

// Cargar datos si se está editando una mascota existente
onMounted(() => {
  if (props.mascota.id) {
    formData.nombre = props.mascota.nombre || '';
    formData.especie = props.mascota.especie || '';
    formData.raza = props.mascota.raza || '';
    formData.fechaNacimiento = props.mascota.fechaNacimiento || '';
    formData.sexo = props.mascota.sexo || '';
    formData.clienteId = props.mascota.clienteId || props.clientePreseleccionado?.id || '';
  } else if (props.clientePreseleccionado) {
    formData.clienteId = props.clientePreseleccionado.id;
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
  
  // Validar especie
  if (!formData.especie) {
    errors.especie = 'La especie es obligatoria';
    isValid = false;
  }
  
  // Validar cliente si no hay preseleccionado
  if (!formData.clienteId && !props.clientePreseleccionado) {
    errors.clienteId = 'Debes seleccionar un cliente';
    isValid = false;
  }
  
  return isValid;
};

// Manejar envío del formulario
const handleSubmit = () => {
  if (validateForm()) {
    // Si hay cliente preseleccionado y no hay clienteId, usar el ID del preseleccionado
    if (props.clientePreseleccionado && !formData.clienteId) {
      formData.clienteId = props.clientePreseleccionado.id;
    }
    
    emit('submit', {
      ...formData,
      id: props.mascota.id // Incluir ID si existe (edición)
    });
  }
};
</script>
