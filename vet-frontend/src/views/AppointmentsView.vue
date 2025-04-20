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
        <div v-if="showQuickServiceSelector && selectedAppointment.id" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            :appointments="filteredAppointments" 
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';
import AppointmentList from '../components/appointments/AppointmentList.vue';
import AppointmentForm from '../components/appointments/AppointmentForm.vue';
import AppointmentDetails from '../components/appointments/AppointmentDetails.vue';
import QuickServiceSelector from '../components/appointments/QuickServiceSelector.vue';
import appointmentService from '../services/appointmentService';
import { userService } from '../services/api';
import { getAllClientes } from '../services/clientService';

const router = useRouter();
const authStore = useAuthStore();
const isSidebarOpen = ref(false);

// Estado principal
const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const currentView = ref('list');
const selectedAppointment = ref({});
const submitting = ref(false);
const veterinarios = ref([]);
const clientes = ref([]);
// Estado para el modal de servicios rápidos
const showQuickServiceSelector = ref(false);

// Estado para filtros
const statusFilter = ref('');
const dateRangeFilter = ref({ startDate: '', endDate: '' });

// Verificar permisos
const hasCreatePermission = computed(() => authStore.hasPermission('CITA_CREATE'));
const hasUpdatePermission = computed(() => authStore.hasPermission('CITA_UPDATE'));
const hasDeletePermission = computed(() => authStore.hasPermission('CITA_DELETE'));

// Cargar datos al montar
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  // Verificar permisos para acceder a esta vista
  if (!authStore.hasPermission('CITA_READ')) {
    router.push('/dashboard');
    return;
  }

  try {
    // Cargar los datos iniciales en paralelo
    await Promise.all([
      loadAppointments(),
      loadVeterinarios(),
      loadClientes()
    ]);
  } catch (err) {
    console.error("Error cargando datos iniciales:", err);
    error.value = "Error al cargar los datos iniciales";
  }
});

// Filtrar citas
const filteredAppointments = computed(() => {
  if (!appointments.value || !Array.isArray(appointments.value)) return [];
  
  let filtered = [...appointments.value];
  
  // Filtro por estado
  if (statusFilter.value) {
    filtered = filtered.filter(a => a.estado === statusFilter.value);
  }
  
  // Filtro por rango de fechas
  if (dateRangeFilter.value.startDate) {
    const startDate = new Date(dateRangeFilter.value.startDate);
    filtered = filtered.filter(a => new Date(a.fecha) >= startDate);
  }
  
  if (dateRangeFilter.value.endDate) {
    const endDate = new Date(dateRangeFilter.value.endDate);
    endDate.setHours(23, 59, 59);
    filtered = filtered.filter(a => new Date(a.fecha) <= endDate);
  }
  
  // Ordenar por fecha y hora
  return filtered.sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    
    if (dateA > dateB) return 1;
    if (dateA < dateB) return -1;
    
    // Si las fechas son iguales, ordenar por hora
    if (a.hora && b.hora) {
      // Verificar si hora es un objeto con propiedades hour y minute
      let timeA, timeB;
      
      if (typeof a.hora === 'object' && a.hora !== null) {
        timeA = (a.hora.hour || 0) * 60 + (a.hora.minute || 0);
      } else if (typeof a.hora === 'string') {
        const [hoursA, minutesA] = a.hora.split(':').map(Number);
        timeA = hoursA * 60 + minutesA;
      } else {
        timeA = 0;
      }
      
      if (typeof b.hora === 'object' && b.hora !== null) {
        timeB = (b.hora.hour || 0) * 60 + (b.hora.minute || 0);
      } else if (typeof b.hora === 'string') {
        const [hoursB, minutesB] = b.hora.split(':').map(Number);
        timeB = hoursB * 60 + minutesB;
      } else {
        timeB = 0;
      }
      
      return timeA - timeB;
    }
    
    return 0;
  });
});

// Cargar citas
const loadAppointments = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log("Cargando citas usando appointmentService...");
    const data = await appointmentService.getAllCitas();
    appointments.value = Array.isArray(data) ? data : [];
    console.log('Citas cargadas:', appointments.value);
  } catch (err) {
    console.error('Error cargando citas:', err);
    error.value = 'Error al cargar las citas. Por favor, intente nuevamente.';
    appointments.value = []; // Inicializar con array vacío para evitar errores
  } finally {
    loading.value = false;
  }
};

// Cargar veterinarios
const loadVeterinarios = async () => {
  try {
    const response = await userService.getVeterinarios();
    // Asegurar que siempre tenemos un array
    if (response && response.data && Array.isArray(response.data)) {
      veterinarios.value = response.data;
    } else if (Array.isArray(response)) {
      veterinarios.value = response;
    } else {
      console.warn("Respuesta de veterinarios no es un array:", response);
      veterinarios.value = [];
    }
  } catch (err) {
    console.error('Error cargando veterinarios:', err);
    veterinarios.value = []; // Inicializar con array vacío para evitar errores
  }
};

// Cargar clientes
const loadClientes = async () => {
  try {
    // Usar la función importada directamente
    const data = await getAllClientes();
    // Asegurar que siempre tenemos un array
    if (data && Array.isArray(data)) {
      clientes.value = data;
    } else {
      console.warn("Respuesta de clientes no es un array:", data);
      clientes.value = [];
    }
  } catch (err) {
    console.error('Error cargando clientes:', err);
    clientes.value = []; // Inicializar con array vacío para evitar errores
  }
};

// Funciones para el Sidebar
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Gestión de vistas
// Renombrar showNewAppointmentForm a showAddAppointmentForm
const showAddAppointmentForm = () => {
  selectedAppointment.value = {};
  currentView.value = 'form';
};

const showAppointmentDetails = (appointment) => {
  selectedAppointment.value = appointment;
  currentView.value = 'details';
};

// Renombrar showAppointmentForm a showEditAppointmentForm
const showEditAppointmentForm = (appointment) => {
  selectedAppointment.value = appointment;
  currentView.value = 'form';
};

// Mostrar/Ocultar vista de servicios rápidos
const openQuickServiceSelector = (appointment) => {
  selectedAppointment.value = appointment;
  showQuickServiceSelector.value = true;
};

// Añadir función cancelQuickServiceSelector
const cancelQuickServiceSelector = () => {
  showQuickServiceSelector.value = false;
};

// Añadir función handleQuickServicesAdded
const handleQuickServicesAdded = (addedServices) => {
  console.log('Servicios rápidos añadidos:', addedServices);
  showQuickServiceSelector.value = false;
  // Opcional: Recargar detalles de la cita si es necesario
  if (currentView.value === 'details') {
    // Podrías querer actualizar la información en AppointmentDetails
    // o simplemente confiar en que AppointmentServices se actualiza solo.
  }
};

// Guardar cita (crear o actualizar) usando appointmentService
const saveAppointment = async (appointmentData) => {
  submitting.value = true;
  
  try {
    let savedAppointment;
    
    if (appointmentData.id) {
      // Actualizar usando appointmentService
      savedAppointment = await appointmentService.updateCita(appointmentData.id, appointmentData);
      
      // Actualizar en el array local
      const index = appointments.value.findIndex(a => a.id === appointmentData.id);
      if (index !== -1) {
        appointments.value[index] = savedAppointment;
      }
    } else {
      // Crear nueva usando appointmentService
      savedAppointment = await appointmentService.createCita(appointmentData);
      appointments.value.push(savedAppointment);
    }
    
    currentView.value = 'list';
  } catch (err) {
    console.error('Error guardando cita:', err);
    alert('Error al guardar la cita. Por favor, revise los datos e intente nuevamente.');
  } finally {
    submitting.value = false;
  }
};

// Eliminar cita usando appointmentService
const deleteAppointment = async (appointment) => {
  try {
    await appointmentService.deleteCita(appointment.id);
    appointments.value = appointments.value.filter(a => a.id !== appointment.id);
    
    if (currentView.value === 'details') {
      currentView.value = 'list';
    }
  } catch (err) {
    console.error('Error eliminando cita:', err);
    alert('Error al eliminar la cita. Por favor, intente nuevamente.');
  }
};

// Cancelar cita usando appointmentService
const cancelAppointment = async (appointment) => {
  try {
    const updatedAppointment = { ...appointment, estado: 'CANCELADA' };
    await appointmentService.updateCita(appointment.id, updatedAppointment);
    
    // Actualizar en el array local
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index] = { ...appointments.value[index], estado: 'CANCELADA' };
    }
    
    if (currentView.value === 'details') {
      // Actualizar la vista de detalles
      selectedAppointment.value = { ...selectedAppointment.value, estado: 'CANCELADA' };
    }
  } catch (err) {
    console.error('Error cancelando cita:', err);
    alert('Error al cancelar la cita. Por favor, intente nuevamente.');
  }
};

// Completar cita usando appointmentService
const completeAppointment = async (appointment) => {
  try {
    const updatedAppointment = { ...appointment, estado: 'COMPLETADA' };
    await appointmentService.updateCita(appointment.id, updatedAppointment);
    
    // Actualizar en el array local
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index] = { ...appointments.value[index], estado: 'COMPLETADA' };
    }
    
    if (currentView.value === 'details') {
      // Actualizar la vista de detalles
      selectedAppointment.value = { ...selectedAppointment.value, estado: 'COMPLETADA' };
    }
  } catch (err) {
    console.error('Error completando cita:', err);
    alert('Error al completar la cita. Por favor, intente nuevamente.');
  }
};

// Filtrar por estado
const filterByStatus = (status) => {
  statusFilter.value = status;
};

// Filtrar por rango de fechas
const filterByDateRange = (dateRange) => {
  dateRangeFilter.value = dateRange;
};

// Limpiar filtros
const clearFilters = () => {
  statusFilter.value = '';
  dateRangeFilter.value = { startDate: '', endDate: '' };
  // No llamar a loadAppointments aquí, la propiedad computada se encargará
  // loadAppointments();
};

// Manejar guardado de servicios rápidos (renombrado de handleQuickServiceSaved)
const handleQuickServiceSaved = () => {
  // Esta función parece redundante ahora con handleQuickServicesAdded,
  // la mantenemos por si se usa en otro lugar, pero revisar si es necesaria.
  // Si no, se puede eliminar junto con su @saved en AppointmentDetails si existe.
  currentView.value = 'details'; // O quizás volver a la lista?
};
</script>
