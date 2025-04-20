<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Cabecera con información del servicio -->
    <div class="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center">
          <div class="h-16 w-16 rounded-full bg-white text-teal-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div class="ml-4 text-white">
            <h2 class="text-xl font-semibold">{{ service.nombre }}</h2>
            <p class="mt-1 text-teal-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
              Precio: {{ formatPrice(service.precio) }}
            </p>
          </div>
        </div>
        <div v-if="hasUpdatePermission" class="mt-4 md:mt-0 flex space-x-2">
          <button 
            @click="$emit('edit-service', service)" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar Servicio
          </button>
        </div>
      </div>
    </div>
    
    <!-- Descripción del servicio -->
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
      <p class="text-gray-700 whitespace-pre-line">{{ service.descripcion || 'No hay descripción disponible para este servicio.' }}</p>
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
      
      <button 
        v-if="hasDeletePermission"
        @click="confirmDelete" 
        class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Eliminar Servicio
      </button>
    </div>
    
    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="mb-4 text-gray-600">
          ¿Estás seguro de que deseas eliminar el servicio <span class="font-semibold">{{ service.nombre }}</span>?
          <br><span class="text-red-600 text-sm">Esta acción no se puede deshacer.</span>
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="deleteService" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
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

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'edit-service', 'delete-service']);

const authStore = useAuthStore();
const showDeleteModal = ref(false);

// Permisos para acciones
const hasUpdatePermission = computed(() => authStore.hasPermission('SERVICIO_UPDATE'));
const hasDeletePermission = computed(() => authStore.hasPermission('SERVICIO_DELETE'));

// Formatear precio
const formatPrice = (price) => {
  return `$${Number(price).toLocaleString('es-CL')}`;
};

// Confirmar eliminación
const confirmDelete = () => {
  showDeleteModal.value = true;
};

// Eliminar servicio
const deleteService = () => {
  emit('delete-service', props.service);
  showDeleteModal.value = false;
};
</script>
