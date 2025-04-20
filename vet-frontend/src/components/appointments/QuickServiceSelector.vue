<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Agregar Servicios a la Cita</h3>
    
    <div v-if="isLoading" class="py-8 flex justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      <span class="ml-3 text-gray-600">Cargando servicios disponibles...</span>
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4">
      <p class="font-medium">Error al cargar servicios</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!serviciosArray.length" class="py-8 text-center text-gray-500">
      <p>No hay servicios disponibles para agregar.</p>
      <button 
        @click="$emit('cancel')" 
        class="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        Volver
      </button>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div 
          v-for="service in serviciosArray" 
          :key="service.id" 
          @click="toggleServiceSelection(service)"
          :class="[
            'border rounded-lg p-4 cursor-pointer transition-all',
            selectedServices.some(s => s.servicioId === service.id) 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
          ]"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-medium text-gray-900">{{ service.nombre }}</h4>
              <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ service.descripcion || 'Sin descripción' }}</p>
            </div>
            <span class="font-semibold text-teal-600">{{ formatPrice(service.precio) }}</span>
          </div>
          
          <div 
            v-if="selectedServices.some(s => s.servicioId === service.id)"
            class="mt-4 flex items-center justify-between"
          >
            <div class="flex items-center">
              <button 
                @click.stop="decrementQuantity(service.id)"
                class="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <span class="mx-2 font-medium">
                {{ getServiceQuantity(service.id) }}
              </span>
              
              <button 
                @click.stop="incrementQuantity(service.id)"
                class="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <span class="text-sm font-medium text-teal-700">
              Total: {{ formatPrice(getServiceTotal(service)) }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="selectedServices.length > 0" class="border-t pt-4 mt-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-medium">Total:</span>
          <span class="text-xl font-bold text-teal-700">{{ formatPrice(totalAmount) }}</span>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="saveServices"
            type="button"
            class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
            <span v-else>Guardar Servicios</span>
          </button>
        </div>
      </div>
      
      <p v-else class="text-center text-gray-500 my-8">
        Selecciona los servicios que deseas agregar a esta cita.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// Importar el servicio dedicado
import serviceService from '../../services/serviceService';
// Importar función nombrada
import { addServicioToCita } from '../../services/citaServicioService';

const props = defineProps({
  citaId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['cancel', 'saved']);

// Estado
const availableServices = ref([]);
const selectedServices = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref(null);

// Propiedad computada para asegurar que siempre trabajamos con un array
const serviciosArray = computed(() => {
  // Si availableServices es un array, devolver directo
  if (Array.isArray(availableServices.value)) {
    return availableServices.value;
  }
  
  // Si es un objeto con una propiedad "data" que es un array
  if (availableServices.value && Array.isArray(availableServices.value.data)) {
    return availableServices.value.data;
  }
  
  // Si es un objeto pero no contiene un array en "data"
  if (availableServices.value && typeof availableServices.value === 'object') {
    // Intentar extraer valores si es posible
    const values = Object.values(availableServices.value);
    if (values.length && Array.isArray(values[0])) {
      return values[0];
    }
  }
  
  // En cualquier otro caso, devolver array vacío
  return [];
});

// Calcular total
const totalAmount = computed(() => {
  return selectedServices.value.reduce((sum, item) => {
    // Buscar el servicio correspondiente
    const service = serviciosArray.value.find(s => s.id === item.servicioId);
    // Si existe, sumar el precio * cantidad, de lo contrario seguir con la suma actual
    return sum + (service?.precio * item.cantidad || 0);
  }, 0);
});

// Formatear precio
const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return '$ --';
  }
  return `$${numericPrice.toLocaleString('es-CL')}`;
};

// Cargar servicios disponibles
const loadAvailableServices = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Usar el servicio dedicado
    const services = await serviceService.getAllServices();
    availableServices.value = Array.isArray(services) ? services : [];
  } catch (err) {
    console.error('Error al cargar servicios disponibles:', err);
    error.value = err.message || 'No se pudieron cargar los servicios.';
    availableServices.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Manejar selección de servicio
const toggleServiceSelection = (service) => {
  if (!service || !service.id) {
    console.error("Servicio inválido:", service);
    return;
  }
  
  const index = selectedServices.value.findIndex(s => s.servicioId === service.id);
  
  if (index === -1) {
    // Agregar servicio
    selectedServices.value.push({
      citaId: props.citaId,
      servicioId: service.id,
      cantidad: 1,
      nombreServicio: service.nombre,
      descripcionServicio: service.descripcion || '',
      precioUnitario: service.precio,
      precioTotal: service.precio
    });
  } else {
    // Eliminar servicio
    selectedServices.value.splice(index, 1);
  }
};

// Obtener cantidad de un servicio
const getServiceQuantity = (serviceId) => {
  const service = selectedServices.value.find(s => s.servicioId === serviceId);
  return service ? service.cantidad : 0;
};

// Incrementar cantidad
const incrementQuantity = (serviceId) => {
  const service = selectedServices.value.find(s => s.servicioId === serviceId);
  if (service) {
    service.cantidad++;
    updateServiceTotal(service);
  }
};

// Decrementar cantidad
const decrementQuantity = (serviceId) => {
  const service = selectedServices.value.find(s => s.servicioId === serviceId);
  if (service && service.cantidad > 1) {
    service.cantidad--;
    updateServiceTotal(service);
  }
};

// Actualizar total del servicio
const updateServiceTotal = (service) => {
  if (!service) return;
  
  const availableService = serviciosArray.value.find(s => s.id === service.servicioId);
  if (availableService && availableService.precio) {
    service.precioTotal = availableService.precio * service.cantidad;
  }
};

// Obtener total de un servicio
const getServiceTotal = (service) => {
  if (!service || !service.id) return 0;
  
  const selectedService = selectedServices.value.find(s => s.servicioId === service.id);
  return selectedService ? selectedService.precioTotal : 0;
};

// Guardar servicios
const saveServices = async () => {
  if (selectedServices.value.length === 0) {
    alert('Por favor, selecciona al menos un servicio.');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Guardar cada servicio seleccionado usando la función importada
    for (const service of selectedServices.value) {
      await addServicioToCita(service);
    }
    
    emit('saved', selectedServices.value);
  } catch (error) {
    console.error('Error al guardar servicios:', error);
    alert('Ocurrió un error al guardar los servicios. Por favor, inténtelo de nuevo.');
  } finally {
    isSubmitting.value = false;
  }
};

// Inicializar
onMounted(() => {
  loadAvailableServices();
});
</script>
