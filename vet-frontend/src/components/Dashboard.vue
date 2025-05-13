<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { dashboardService } from '../services/api';
import appointmentService from '../services/appointmentService';
import Sidebar from './Sidebar.vue'; // Importar el nuevo componente

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const isSidebarOpen = ref(false);
// Nuevo estado para rastrear si el sidebar está colapsado
const isSidebarCollapsed = ref(false);

// Propiedades computadas para determinar permisos del usuario según su rol
const showStatistics = computed(() => true); // Todos los roles pueden ver estadísticas básicas
const showAppointments = computed(() => 
  authStore.isVeterinario || authStore.isGerente || authStore.isAdmin || 
  authStore.isAdminVeterinaria || authStore.hasPermission('CITA_READ')
);
const showServices = computed(() => true); // Todos los roles pueden ver servicios
const canCreateAppointment = computed(() => 
  authStore.isVeterinario || authStore.isGerente || authStore.isAdmin || 
  authStore.isAdminVeterinaria || authStore.hasPermission('CITA_CREATE')
);

// Función para mostrar el nombre del rol en formato legible
const userRoleDisplay = computed(() => {
  if (authStore.user?.rolNombre) {
    // Extraer el nombre del rol sin el prefijo ROLE_
    const rolBase = authStore.user.rolNombre.replace('ROLE_', '');
    
    // Mapear los nuevos roles a nombres más amigables para el usuario
    switch (rolBase) {
      case 'ADMIN_SISTEMA': return 'Administrador del Sistema';
      case 'ADMIN_USUARIOS': return 'Administrador de Usuarios';
      case 'ADMIN_VETERINARIA': return 'Administrador Veterinario';
      case 'GERENTE': return 'Gerente';
      case 'VETERINARIO_SENIOR': return 'Veterinario Senior';
      case 'VETERINARIO_JUNIOR': return 'Veterinario Junior';
      case 'RECEPCIONISTA': return 'Recepcionista';
      case 'ASISTENTE': return 'Asistente';
      case 'CONSULTOR_DATOS': return 'Consultor de Datos';
      // Mantener compatibilidad con roles antiguos
      case 'ADMIN': return 'Administrador';
      case 'VETERINARIO': return 'Veterinario';
      case 'EMPLEADO': return 'Empleado';
      default: return rolBase; // Si es un rol desconocido, mostrar el nombre original
    }
  }
  
  if (!authStore.user?.permissions) return 'Usuario';
  
  // Compatibilidad con el sistema anterior de permisos
  const permissions = authStore.user.permissions;
  if (permissions.includes('ROLE_ADMIN') || 
      permissions.includes('ROLE_ADMIN_SISTEMA') || 
      permissions.includes('ROLE_ADMIN_USUARIOS') || 
      permissions.includes('ROLE_ADMIN_VETERINARIA')) return 'Administrador';
      
  if (permissions.includes('ROLE_VETERINARIO') || 
      permissions.includes('ROLE_VETERINARIO_SENIOR') || 
      permissions.includes('ROLE_VETERINARIO_JUNIOR')) return 'Veterinario';
      
  if (permissions.includes('ROLE_EMPLEADO') || 
      permissions.includes('ROLE_GERENTE') || 
      permissions.includes('ROLE_RECEPCIONISTA') || 
      permissions.includes('ROLE_ASISTENTE')) return 'Empleado';
      
  if (permissions.includes('ROLE_CONSULTOR_DATOS')) return 'Consultor de Datos';
  
  return 'Usuario';
});

// Verificar autenticación al montar
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  loadDashboardData();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Datos para el dashboard
const statistics = ref([
  { name: 'Pacientes Atendidos', value: '0', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-blue-100 text-blue-800' },
  { name: 'Citas Hoy', value: '0', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-green-100 text-green-800' },
  { name: 'Vacunas Aplicadas', value: '0', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'bg-purple-100 text-purple-800' },
  { name: 'Ventas', value: '$0', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-yellow-100 text-yellow-800' }
]);

const services = ref([]);
const proximasCitas = ref([]);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Nuevo manejador para el evento toggle-sidebar emitido por el componente Sidebar
const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};

// Mapeo de íconos para servicios según sus nombres
const serviceIcons = {
  'Consulta General': { icon: '🩺', color: 'bg-blue-50 border-blue-200' },
  'Vacunación': { icon: '💉', color: 'bg-green-50 border-green-200' },
  'Cirugía': { icon: '🔪', color: 'bg-red-50 border-red-200' },
  'Urgencias': { icon: '🚑', color: 'bg-yellow-50 border-yellow-200' },
  'Peluquería': { icon: '✂️', color: 'bg-purple-50 border-purple-200' },
  'Laboratorio': { icon: '🧪', color: 'bg-indigo-50 border-indigo-200' },
  // Valores por defecto para otros servicios
  'default': { icon: '🏥', color: 'bg-gray-50 border-gray-200' }
};

// Mapeo para emojis de mascotas según especie
const especieEmojis = {
  'Perro': '🐶',
  'Gato': '🐱',
  'Ave': '🦜',
  'Conejo': '🐰',
  'Hámster': '🐹',
  'Reptil': '🦎',
  'default': '🐾'
};

// Formateador para moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

// Cargar datos del dashboard
const loadDashboardData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Comprobar que el usuario esté autenticado
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Cargar estadísticas según los permisos del usuario
    if (showStatistics.value) {
      try {
        const statsResponse = await dashboardService.getStats().catch(error => {
          console.warn('No se pudieron cargar las estadísticas. Posible falta de permisos:', error.response?.status);
          // Si es un error 403, mostraremos valores por defecto en vez de mostrar un error
          return { data: null };
        });
        
        if (statsResponse?.data) {
          statistics.value[0].value = statsResponse.data.pacientesAtendidos;
          statistics.value[1].value = statsResponse.data.citasDelDia;
          statistics.value[2].value = statsResponse.data.vacunasAplicadas;
        }
      } catch (statsError) {
        console.error('Error inesperado cargando estadísticas:', statsError);
        // Seguir con la carga de otros datos
      }
    }
    
    // Cargar servicios si el usuario puede ver servicios
    if (showServices.value) {
      try {
        const serviciosResponse = await dashboardService.getServicios();
        if (serviciosResponse.data) {
          services.value = serviciosResponse.data.map(servicio => {
            const iconConfig = serviceIcons[servicio.nombre] || serviceIcons.default;
            return {
              name: servicio.nombre,
              description: servicio.descripcion,
              icon: iconConfig.icon,
              color: iconConfig.color,
              precio: formatCurrency(servicio.precio)
            };
          });
        }
      } catch (serviciosError) {
        console.error('Error cargando servicios:', serviciosError);
        services.value = [];
      }
    }
    
    // Cargar próximas citas solo si el usuario tiene permisos para ver citas
    if (showAppointments.value) {
      try {
        console.log('Intentando cargar próximas citas...');
        const citasResponse = await appointmentService.getProximasCitas();
        
        if (citasResponse && Array.isArray(citasResponse)) {
          proximasCitas.value = citasResponse;
          console.log('Citas cargadas correctamente:', proximasCitas.value.length);
        } else {
          console.warn('No se pudieron cargar las próximas citas o formato incorrecto');
          proximasCitas.value = [];
        }
      } catch (citasError) {
        console.error('Error durante la carga de próximas citas:', citasError);
        proximasCitas.value = [];
      }
    }  } catch (generalError) {
    console.error('Error general cargando datos del dashboard:', generalError);
    
    // Personalizar el mensaje de error según el tipo de error
    if (generalError.response) {
      const status = generalError.response.status;
      if (status === 403) {
        error.value = 'No tienes permisos para acceder a algunos datos del dashboard. Contacta al administrador para obtener los permisos necesarios.';
      } else if (status === 401) {
        error.value = 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.';
      } else {
        error.value = `Error del servidor (${status}). Por favor, intenta más tarde.`;
      }
    } else {
      error.value = 'No se pudieron cargar los datos del dashboard. Por favor, verifica tu conexión e intenta más tarde.';
    }
  } finally {
    loading.value = false;
  }
};

// Obtener el icono correspondiente a la especie de la mascota
const getMascotaEmoji = (especie) => {
  // Ahora verifica tanto la propiedad plana como la anidada
  return especieEmojis[especie] || especieEmojis.default;
};

// Obtener el color de fondo según el estado de la cita
const getEstadoCitaClass = (estado) => {
  switch (estado?.toUpperCase()) {
    case 'CONFIRMADA':
      return 'bg-green-100 text-green-800';
    case 'PENDIENTE':
    case 'POR CONFIRMAR':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELADA':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Formatear fecha de la cita
const formatFechaCita = (fecha, hora) => {
  if (!fecha) return 'No disponible';
  
  try {
    // Determinar si es hoy
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Formatear la hora correctamente
    let horaFormateada = '';
    
    if (hora) {
      if (typeof hora === 'string') {
        // Asegurarse de que la hora tenga el formato correcto (HH:MM)
        horaFormateada = hora.substring(0, 5);
      } else if (hora.hour !== undefined) {
        // Caso para el formato como objeto
        const h = Math.min(Math.max(0, hora.hour), 23);
        const m = Math.min(Math.max(0, 0), 59);
        horaFormateada = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }
    
    if (fechaCita.getTime() === hoy.getTime()) {
      return `Hoy, ${horaFormateada || 'hora no disponible'}`;
    }
    
    // Determinar si es mañana
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    if (fechaCita.getTime() === manana.getTime()) {
      return `Mañana, ${horaFormateada || 'hora no disponible'}`;
    }
    
    // Formatear fecha para mostrar
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long'
    }).format(fechaCita) + (horaFormateada ? `, ${horaFormateada}` : '');
  } catch (error) {
    console.error('Error formateando fecha de cita:', error);
    return 'Fecha inválida';
  }
};

// Nuevo método para acceder seguro a propiedades anidadas
const safeGet = (obj, path, defaultValue = '') => {
  try {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : defaultValue, obj);
  } catch (e) {
    return defaultValue;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar Component -->
    <Sidebar 
      :user="authStore.user" 
      :isSidebarOpen="isSidebarOpen"
      @logout="handleLogout"
      @toggle-sidebar="handleSidebarToggle"
    />

    <!-- Main content - ajustar para responder al estado colapsado -->
    <div :class="[
      'transition-all duration-300 ease-in-out', 
      isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
    ]">
      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center bg-white shadow-sm h-16 px-4">
        <button @click="toggleSidebar" class="text-gray-600 focus:outline-none">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="ml-4 flex items-center">
          <img src="https://img.icons8.com/fluency/48/000000/pet.png" alt="Logo" class="h-8 w-8 mr-2" />
          <span class="text-gray-800 text-lg font-bold">VetCare</span>
        </div>
      </div>

      <main class="p-6 animate__animated animate__fadeIn">
        <!-- Header section mejorado para espacio en pantallas pequeñas -->
        <header class="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p class="mt-1 text-gray-600">Bienvenido de nuevo, {{ authStore.user?.nombreUsuario || 'Usuario' }}</p>
            </div>            <div class="mt-4 md:mt-0 flex space-x-3">
              <button class="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H5V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <span class="hidden sm:inline">Hoy</span>
                </span>
              </button>
              <button 
                v-if="canCreateAppointment"
                class="bg-teal-600 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none"
                @click="router.push('/appointments/new')"
              >
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-0 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="hidden sm:inline">Nueva Cita</span>
                </span>
              </button>
            </div>
          </div>
        </header>

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 mb-8">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{{ error }}</p>
          </div>
        </div>        <div v-else>
          <!-- Contenido responsivo adaptado al estado colapsado del sidebar -->
          
          <!-- Mensaje de bienvenida personalizado según el rol -->
          <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div class="flex items-center">
              <div class="bg-teal-100 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-800">
                  {{ authStore.user?.nombreUsuario ? `¡Hola, ${authStore.user.nombreUsuario}!` : '¡Bienvenido!' }}
                </h3>
                <p class="text-gray-600">Has iniciado sesión como <span class="font-medium text-teal-600">{{ userRoleDisplay }}</span></p>
              </div>
            </div>
          </div>
          
          <!-- Información para administradores sobre permisos faltantes -->
          <div v-if="authStore.isAdminSistema" class="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 mb-6 animate__animated animate__fadeIn">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-medium">Información para Administradores del Sistema</p>
                <p class="mt-1 text-sm">Como administrador del sistema, puede configurar permisos como <code>STATS_READ</code> para acceder a estadísticas completas. Por favor revise la configuración de roles en el panel de administración.</p>
              </div>
            </div>
          </div>
          
          <!-- Stats Grid - mejorado para pantallas pequeñas -->
          <div v-if="showStatistics" class="mb-8 grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(stat, index) in statistics" :key="index" class="bg-white rounded-xl overflow-hidden shadow-sm">
              <div class="p-4 sm:p-5">
                <div class="flex items-center">
                  <div :class="[stat.color, 'rounded-lg p-3']">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path :d="stat.icon"></path>
                    </svg>
                  </div>
                  <div class="ml-3 sm:ml-5">
                    <p class="text-gray-500 text-xs sm:text-sm">{{ stat.name }}</p>
                    <h3 class="text-lg sm:text-xl font-bold text-gray-800">{{ stat.value }}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>          <!-- Services Grid - mejorado para adaptarse -->
          <div v-if="showServices">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
            <div class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div v-for="(service, index) in services" :key="index" :class="[service.color, 'group bg-white rounded-xl border overflow-hidden shadow-sm transition-transform hover:scale-105 transform']">
                <div class="p-4 sm:p-5">
                  <div class="flex items-center justify-between mb-3">
                    <div class="text-2xl sm:text-3xl">{{ service.icon }}</div>
                    <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white shadow-inner flex items-center justify-center">
                      <span class="text-xs sm:text-sm font-medium text-gray-700">{{ service.precio }}</span>
                    </div>
                  </div>
                  <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-1">{{ service.name }}</h3>
                  <p class="text-xs sm:text-sm text-gray-600">{{ service.description }}</p>
                </div>
              </div>
            </div>
          </div>          <!-- Appointments Section - tabla responsiva -->
          <div v-if="showAppointments" class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h2 class="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Próximas Citas</h2>
              <div v-if="proximasCitas.length > 0" class="text-sm text-gray-500">
                Mostrando {{ proximasCitas.length }} cita(s)
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <div v-if="proximasCitas.length === 0" class="text-center py-8 text-gray-500">
                No hay citas programadas próximamente.
              </div>
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                      <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                      <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(cita, index) in proximasCitas" :key="index">
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                            <span class="text-base sm:text-lg">{{ getMascotaEmoji(cita.especie || safeGet(cita, 'mascota.especie')) }}</span>
                          </div>
                          <div class="ml-3 sm:ml-4">
                            <div class="text-xs sm:text-sm font-medium text-gray-900">
                              {{ cita.mascotaNombre || safeGet(cita, 'mascota.nombre') || 'Sin nombre' }}
                            </div>
                            <div class="text-xs sm:text-sm text-gray-500">
                              {{ cita.raza || cita.especie || safeGet(cita, 'mascota.raza') || safeGet(cita, 'mascota.especie') || 'Especie no especificada' }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {{ cita.clienteNombre || safeGet(cita, 'cliente.nombre') || 'No registrado' }}
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {{ formatFechaCita(cita.fecha, cita.hora) }}
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {{ cita.motivo || safeGet(cita, 'servicio.nombre') || 'No especificado' }}
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getEstadoCitaClass(cita.estado)]">
                          {{ cita.estado || 'Pendiente' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Sección específica para Consultores de Datos -->
          <div v-if="authStore.isConsultorDatos" class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Análisis de Datos</h2>
            </div>
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4 flex items-center">
                  <div class="bg-blue-100 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-blue-800">Informes de Análisis</h3>
                    <p class="text-sm text-blue-600">Accede a los informes detallados de servicios y citas</p>
                  </div>
                </div>
                <div class="bg-purple-50 rounded-lg p-4 flex items-center">
                  <div class="bg-purple-100 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-purple-800">Métricas de Rendimiento</h3>
                    <p class="text-sm text-purple-600">Visualiza el rendimiento y las tendencias actuales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="mt-8 text-center">
          <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Sistema de Gestión Veterinaria. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  </div>
</template>