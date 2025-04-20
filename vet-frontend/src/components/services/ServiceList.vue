<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Header con buscador y filtros -->
    <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Servicios Médicos</h2>
      <div class="flex flex-col sm:flex-row w-full sm:w-auto sm:space-x-3 space-y-2 sm:space-y-0">
        <!-- Buscador por nombre -->
        <div class="relative flex-grow">
          <input
            type="text"
            v-model="searchTermName"
            placeholder="Buscar por nombre"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            @keyup.enter="searchByName"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Filtros de precio (en dropdown) -->
        <div class="relative">
          <button
            @click="showPriceFilters = !showPriceFilters"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
            </svg>
            Filtrar Precio
          </button>
          
          <!-- Dropdown con filtros de precio -->
          <div v-if="showPriceFilters" class="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3">
            <div class="mb-3">
              <label class="block text-sm text-gray-700 mb-1">Precio mínimo</label>
              <div class="flex">
                <input 
                  type="number" 
                  v-model="minPrice" 
                  min="0" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Desde..."
                />
                <button 
                  @click="filterByMinPrice"
                  class="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-sm text-gray-700 mb-1">Precio máximo</label>
              <div class="flex">
                <input 
                  type="number" 
                  v-model="maxPrice" 
                  min="0" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Hasta..."
                />
                <button 
                  @click="filterByMaxPrice"
                  class="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <button 
                @click="clearFilters" 
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Limpiar filtros
              </button>
              <button 
                @click="showPriceFilters = false" 
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
        
        <!-- Botón de nuevo servicio -->
        <button
          v-if="hasCreatePermission"
          @click="$emit('add-service')"
          class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Servicio
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
      <span class="ml-2 text-gray-500">Cargando servicios...</span>
    </div>
    
    <!-- Mensaje de error -->
    <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p class="font-medium">Error al cargar los servicios</p>
      <p>{{ error }}</p>
    </div>
    
    <!-- Mensaje sin resultados -->
    <div v-else-if="services.length === 0" class="py-8 text-center text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p v-if="isFiltered">No se encontraron servicios con los filtros aplicados</p>
      <p v-else>No hay servicios registrados. ¡Agrega uno nuevo!</p>
    </div>
    
    <!-- Tabla de servicios -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="service in services" :key="service.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ service.nombre }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 max-w-md">{{ service.descripcion || 'Sin descripción' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {{ formatPrice(service.precio) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button 
                  @click="$emit('view-service', service)" 
                  class="text-blue-600 hover:text-blue-900"
                  title="Ver detalles"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  v-if="hasUpdatePermission"
                  @click="$emit('edit-service', service)" 
                  class="text-teal-600 hover:text-teal-900"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  v-if="hasDeletePermission"
                  @click="confirmDelete(service)" 
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
          ¿Estás seguro de que deseas eliminar el servicio <span class="font-semibold">{{ serviceToDelete?.nombre }}</span>?
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
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  services: {
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

const emit = defineEmits(['add-service', 'edit-service', 'delete-service', 'view-service', 'search', 'filter']);

const authStore = useAuthStore();

// Permisos para acciones
const hasCreatePermission = computed(() => authStore.hasPermission('SERVICIO_CREATE'));
const hasUpdatePermission = computed(() => authStore.hasPermission('SERVICIO_UPDATE'));
const hasDeletePermission = computed(() => authStore.hasPermission('SERVICIO_DELETE'));

// Estado para filtros
const searchTermName = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const showPriceFilters = ref(false);
const serviceToDelete = ref(null);
const showDeleteModal = ref(false);

// Verificar si hay filtros activos
const isFiltered = computed(() => {
  return searchTermName.value.trim() !== '' || minPrice.value !== '' || maxPrice.value !== '';
});

// Texto que muestra los filtros activos
const activeFiltersText = computed(() => {
  const filters = [];
  
  if (searchTermName.value.trim() !== '') {
    filters.push(`"${searchTermName.value}"`);
  }
  
  if (minPrice.value !== '') {
    filters.push(`Desde $${minPrice.value}`);
  }
  
  if (maxPrice.value !== '') {
    filters.push(`Hasta $${maxPrice.value}`);
  }
  
  return filters.join(', ');
});

// Formatear precio con símbolo de peso
const formatPrice = (price) => {
  return `$${Number(price).toLocaleString('es-CL')}`;
};

// Buscar servicios por nombre
const searchByName = () => {
  if (searchTermName.value.trim() !== '') {
    emit('search', { type: 'name', value: searchTermName.value });
  }
};

// Filtrar por precio mínimo
const filterByMinPrice = () => {
  if (minPrice.value !== '') {
    emit('filter', { type: 'minPrice', value: minPrice.value });
  }
};

// Filtrar por precio máximo
const filterByMaxPrice = () => {
  if (maxPrice.value !== '') {
    emit('filter', { type: 'maxPrice', value: maxPrice.value });
  }
};

// Limpiar todos los filtros
const clearFilters = () => {
  searchTermName.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  showPriceFilters.value = false;
  
  // Emitir evento para cargar todos los servicios de nuevo
  emit('search', { type: 'clear' });
};

// Confirmar eliminación
const confirmDelete = (service) => {
  serviceToDelete.value = service;
  showDeleteModal.value = true;
};

// Eliminar servicio
const deleteService = () => {
  emit('delete-service', serviceToDelete.value);
  showDeleteModal.value = false;
  serviceToDelete.value = null;
};
</script>
