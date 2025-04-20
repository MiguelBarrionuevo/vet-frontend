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
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Citas</h1>
          <p class="mt-1 text-gray-600">Agenda y administra citas para tus pacientes.</p>
        </header>

        <!-- Selector rápido de servicios (modal) -->
        <div v-if="showQuickServiceSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <QuickServiceSelector 
              :citaId="selectedAppointment.id" 
              @cancel="cancelQuickServiceSelector" 
              @saved="handleQuickServicesAdded"
            />
          </div>
        </div>

        <!-- Vista principal (lista de citas) -->
        <div v-if="currentView === 'list'">
          <AppointmentList 
            :appointments="appointments" 
            :loading="loading" 
            :error="error"
            @add-appointment="showAddAppointmentForm"
            @edit-appointment="showEditAppointmentForm"
            @delete-appointment="deleteAppointment"
            @view-appointment="showAppointmentDetails"
            @cancel-appointment="cancelAppointment"
            @filter-status="filterByStatus"
            @filter-date-range="filterByDateRange"
            @clear-filters="loadAppointments"
          />
        </div>

        <!-- Vista de formulario de cita (crear/editar) -->
        <div v-else-if="currentView === 'form'">
          <AppointmentForm 
            :appointment="selectedAppointment" 
            :clientes="clientes"
            :veterinarios="veterinarios"
            :isSubmitting="submitting"
            @submit="saveAppointment"
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
              Volver a la lista
            </button>
          </div>
        </div>

        <!-- Vista de detalles de cita -->
        <div v-else-if="currentView === 'details'">
          <AppointmentDetails 
            :appointment="selectedAppointment"
            @back="currentView = 'list'"
            @edit-appointment="showEditAppointmentForm"
            @cancel-appointment="cancelAppointment"
            @delete-appointment="deleteAppointment"
            @complete-appointment="completeAppointment"
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
import AppointmentList from '../components/appointments/AppointmentList.vue';
import AppointmentForm from '../components/appointments/AppointmentForm.vue';
import AppointmentDetails from '../components/appointments/AppointmentDetails.vue';
import QuickServiceSelector from '../components/appointments/QuickServiceSelector.vue';
import appointmentService from '../services/appointmentService';
import citaServicioService from '../services/citaServicioService';
import clientService from '../services/clientService';
import { userService, medicalServiceService } from '../services/api';

const router = useRouter();
const authStore = useAuthStore();

// Estado general
const currentView = ref('list');
const isSidebarOpen = ref(false);
const selectedAppointment = ref({});
const submitting = ref(false);

// Estado para citas
const appointments = ref([]);
const loading = ref(true);
const error = ref(null);

// Estado para datos de formulario
const clientes = ref([]);
const veterinarios = ref([]);
const loadingClientes = ref(false);
const loadingVeterinarios = ref(false);

// Estado adicional para el selector rápido de servicios
const showQuickServiceSelector = ref(false);

// Verificar autenticación y cargar datos
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (!authStore.hasPermission('CITA_READ')) {
    router.push('/dashboard');
    return;
  }
  
  loadAppointments();
  
  // Cargar datos para el formulario (clientes y veterinarios)
  loadClientes();
  loadVeterinarios();
});

// Cargar todas las citas
const loadAppointments = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await appointmentService.getAllCitas();
    appointments.value = data;
  } catch (err) {
    console.error('Error cargando citas:', err);
    error.value = 'No se pudieron cargar las citas. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Cargar todos los clientes para el selector
const loadClientes = async () => {
  loadingClientes.value = true;
  
  try {
    const data = await clientService.getAllClientes();
    clientes.value = data;
  } catch (err) {
    console.error('Error cargando clientes:', err);
    // No establecer error, ya que esto no es crítico para la vista principal
  } finally {
    loadingClientes.value = false;
  }
};

// Cargar todos los veterinarios para el selector
const loadVeterinarios = async () => {
  loadingVeterinarios.value = true;
  
  try {
    const response = await userService.getVeterinarios();
    veterinarios.value = response.data || [];
  } catch (err) {
    console.error('Error cargando veterinarios:', err);
    // No establecer error, ya que esto no es crítico para la vista principal
  } finally {
    loadingVeterinarios.value = false;
  }
};

// Funciones para filtros
const filterByStatus = async (status) => {
  if (!status) {
    return loadAppointments();
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const data = await appointmentService.getCitasByEstado(status);
    appointments.value = data;
  } catch (err) {
    console.error(`Error filtrando citas por estado ${status}:`, err);
    error.value = 'No se pudieron filtrar las citas. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

const filterByDateRange = async ({ startDate, endDate }) => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await appointmentService.getCitasByFechaRange(startDate, endDate);
    appointments.value = data;
  } catch (err) {
    console.error('Error filtrando citas por rango de fechas:', err);
    error.value = 'No se pudieron filtrar las citas. Por favor, intente nuevamente.';
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

// Funciones para gestionar citas
const showAddAppointmentForm = () => {
  selectedAppointment.value = {};
  currentView.value = 'form';
};

const showEditAppointmentForm = (appointment) => {
  selectedAppointment.value = { ...appointment };
  currentView.value = 'form';
};

const showAppointmentDetails = (appointment) => {
  selectedAppointment.value = { ...appointment };
  currentView.value = 'details';
};

const saveAppointment = async (appointmentData) => {
  submitting.value = true;
  
  try {
    let savedAppointment;
    
    if (appointmentData.id) {
      // Actualizar cita existente
      savedAppointment = await appointmentService.updateCita(appointmentData.id, appointmentData);
      const index = appointments.value.findIndex(a => a.id === appointmentData.id);
      if (index !== -1) {
        appointments.value[index] = savedAppointment;
      }
      currentView.value = 'list';
    } else {
      // Crear nueva cita
      savedAppointment = await appointmentService.createCita(appointmentData);
      appointments.value.push(savedAppointment);
      
      // Preguntar si desea agregar servicios ahora
      const wantToAddServices = confirm("Cita creada correctamente. ¿Desea agregar servicios médicos a esta cita ahora?");
      
      if (wantToAddServices) {
        selectedAppointment.value = savedAppointment;
        showQuickServiceSelector.value = true;
      } else {
        currentView.value = 'list';
      }
    }
  } catch (err) {
    console.error('Error guardando cita:', err);
    alert('Ocurrió un error al guardar la cita. Por favor, revise los datos e intente nuevamente.');
  } finally {
    submitting.value = false;
  }
};

// Manejar servicios guardados desde el selector rápido
const handleQuickServicesAdded = (services) => {
  console.log('Servicios agregados:', services);
  showQuickServiceSelector.value = false;
  
  // Mostrar mensaje y redirigir a la lista
  alert(`Se agregaron ${services.length} servicios a la cita.`);
  currentView.value = 'list';
};

// Cancelar el selector rápido
const cancelQuickServiceSelector = () => {
  showQuickServiceSelector.value = false;
  currentView.value = 'list';
};

const deleteAppointment = async (appointment) => {
  try {
    // Primero, eliminar todos los servicios asociados a la cita
    await citaServicioService.removeAllServiciosFromCita(appointment.id);
    
    // Luego, eliminar la cita
    await appointmentService.deleteCita(appointment.id);
    appointments.value = appointments.value.filter(a => a.id !== appointment.id);
    
    // Si está en la vista de detalles, volver a la lista
    if (currentView.value === 'details') {
      currentView.value = 'list';
    }
  } catch (err) {
    console.error('Error eliminando cita:', err);
    alert('Ocurrió un error al eliminar la cita.');
  }
};

const cancelAppointment = async (appointment) => {
  try {
    // Cambiar estado a CANCELADA
    const updatedAppointment = { 
      ...appointment,
      estado: 'CANCELADA'
    };
    
    const result = await appointmentService.updateCita(appointment.id, updatedAppointment);
    
    // Actualizar en la lista local
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index] = result;
    }
    
    // Si está en la vista de detalles, actualizar la cita seleccionada
    if (currentView.value === 'details') {
      selectedAppointment.value = result;
    }
  } catch (err) {
    console.error('Error cancelando cita:', err);
    alert('Ocurrió un error al cancelar la cita.');
  }
};

const completeAppointment = async (appointment) => {
  try {
    // Cambiar estado a COMPLETADA
    const updatedAppointment = { 
      ...appointment,
      estado: 'COMPLETADA'
    };
    
    const result = await appointmentService.updateCita(appointment.id, updatedAppointment);
    
    // Actualizar en la lista local
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index] = result;
    }
    
    // Si está en la vista de detalles, actualizar la cita seleccionada
    if (currentView.value === 'details') {
      selectedAppointment.value = result;
    }
  } catch (err) {
    console.error('Error completando cita:', err);
    alert('Ocurrió un error al marcar la cita como completada.');
  }
};
</script>
