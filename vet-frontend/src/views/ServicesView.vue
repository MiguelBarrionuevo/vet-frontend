<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar Component -->
    <Sidebar
      :user="authStore.user"
      :isSidebarOpen="isSidebarOpen"
      @logout="handleLogout"
    />

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center justify-between bg-white shadow-sm h-16 px-4">
        <button @click="toggleSidebar" class="text-gray-600 focus:outline-none">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex items-center">
          <img src="https://img.icons8.com/fluency/48/000000/pet.png" alt="Logo" class="h-8 w-8 mr-2" />
          <span class="text-gray-800 text-lg font-bold">VetCare</span>
        </div>
        <div></div> <!-- Placeholder para centrar el logo -->
      </div>

      <main class="p-6 animate__animated animate__fadeIn">
        <header class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 class="text-2xl font-bold text-gray-800">Servicios Médicos</h1>
          <p class="mt-1 text-gray-600">Gestión de servicios médicos veterinarios.</p>
        </header>

        <!-- Vista principal (lista de servicios) -->
        <div v-if="currentView === 'list'">
          <ServiceList 
            :services="services" 
            :loading="loading" 
            :error="error"
            @add-service="showAddServiceForm"
            @edit-service="showEditServiceForm"
            @delete-service="deleteService"
            @view-service="showServiceDetails"
            @search="searchServices"
            @filter="filterServices"
          />
        </div>

        <!-- Vista de formulario de servicio (crear/editar) -->
        <div v-else-if="currentView === 'form'">
          <ServiceForm 
            :service="selectedService" 
            :isSubmitting="submitting"
            @submit="saveService"
            @cancel="currentView = 'list'"
          />
          <div class="mt-4 flex">
            <button 
              @click="currentView = 'list'" 
              class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Cancelar
            </button>
          </div>
        </div>

        <!-- Vista de detalles de servicio -->
        <div v-else-if="currentView === 'details'">
          <ServiceDetails 
            :service="selectedService"
            @back="currentView = 'list'"
            @edit-service="showEditServiceForm"
            @delete-service="deleteService"
          />
        </div>

        <!-- Footer -->
        <footer class="mt-8 text-center">
          <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Sistema de Gestión Veterinaria. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';
import ServiceList from '../components/services/ServiceList.vue';
import ServiceForm from '../components/services/ServiceForm.vue';
import ServiceDetails from '../components/services/ServiceDetails.vue';
import serviceService from '../services/serviceService';

const router = useRouter();
const authStore = useAuthStore();

// Estado general
const currentView = ref('list');
const isSidebarOpen = ref(false);
const selectedService = ref({});
const submitting = ref(false);

// Estado para servicios
const services = ref([]);
const loading = ref(true);
const error = ref(null);

// Verificar autenticación y cargar datos
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (!authStore.hasPermission('SERVICIO_READ')) {
    router.push('/dashboard');
    return;
  }
  
  loadServices();
});

// Cargar todos los servicios
const loadServices = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await serviceService.getAllServices();
    services.value = data;
  } catch (err) {
    console.error('Error cargando servicios:', err);
    error.value = 'No se pudieron cargar los servicios. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Buscar servicios según diferentes criterios
const searchServices = async ({ type, value }) => {
  if (type === 'clear') {
    return loadServices();
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    let data;
    
    if (type === 'name') {
      data = await serviceService.searchServicesByName(value);
    } else {
      // Por defecto, cargar todos los servicios
      data = await serviceService.getAllServices();
    }
    
    services.value = data;
  } catch (err) {
    console.error('Error en la búsqueda de servicios:', err);
    error.value = 'No se pudieron buscar los servicios. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Filtrar servicios por precio
const filterServices = async ({ type, value }) => {
  loading.value = true;
  error.value = null;
  
  try {
    let data;
    
    if (type === 'minPrice') {
      data = await serviceService.getServicesByMinPrice(value);
    } else if (type === 'maxPrice') {
      data = await serviceService.getServicesByMaxPrice(value);
    } else {
      // Por defecto, cargar todos los servicios
      data = await serviceService.getAllServices();
    }
    
    services.value = data;
  } catch (err) {
    console.error('Error filtrando servicios:', err);
    error.value = 'No se pudieron filtrar los servicios. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Funciones para navegación
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Funciones para gestionar servicios
const showAddServiceForm = () => {
  selectedService.value = {};
  currentView.value = 'form';
};

const showEditServiceForm = (service) => {
  selectedService.value = { ...service };
  currentView.value = 'form';
};

const showServiceDetails = (service) => {
  selectedService.value = { ...service };
  currentView.value = 'details';
};

const saveService = async (serviceData) => {
  submitting.value = true;
  
  try {
    if (serviceData.id) {
      // Actualizar servicio existente
      const updatedService = await serviceService.updateService(serviceData.id, serviceData);
      const index = services.value.findIndex(s => s.id === serviceData.id);
      if (index !== -1) {
        services.value[index] = updatedService;
      }
    } else {
      // Crear nuevo servicio
      const newService = await serviceService.createService(serviceData);
      services.value.push(newService);
    }
    
    currentView.value = 'list';
  } catch (err) {
    console.error('Error guardando servicio:', err);
    alert('Ocurrió un error al guardar el servicio.');
  } finally {
    submitting.value = false;
  }
};

const deleteService = async (service) => {
  try {
    const success = await serviceService.deleteService(service.id);
    if (success) {
      // Eliminar servicio de la lista y volver a la vista principal
      services.value = services.value.filter(s => s.id !== service.id);
      if (currentView.value === 'details') {
        currentView.value = 'list';
      }
    }
  } catch (err) {
    console.error('Error eliminando servicio:', err);
    alert('Ocurrió un error al eliminar el servicio.');
  }
};
</script>
