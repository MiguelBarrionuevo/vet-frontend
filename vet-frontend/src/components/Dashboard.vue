<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { dashboardService } from '../services/api';
import Sidebar from './Sidebar.vue'; // Importar el nuevo componente

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const isSidebarOpen = ref(false);

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
    
    // Cargar estadísticas
    const statsResponse = await dashboardService.getStats();
    if (statsResponse.data) {
      statistics.value[0].value = statsResponse.data.pacientesAtendidos;
      statistics.value[1].value = statsResponse.data.citasDelDia;
      statistics.value[2].value = statsResponse.data.vacunasAplicadas;
      // Asumimos que ventas es un campo calculado o no disponible por ahora
    }
    
    // Cargar servicios
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
    
    // Cargar próximas citas
    const citasResponse = await dashboardService.getProximasCitas();
    if (citasResponse.data) {
      proximasCitas.value = citasResponse.data;
    }
    
  } catch (err) {
    console.error('Error cargando datos del dashboard:', err);
    error.value = 'No se pudieron cargar los datos del dashboard. Por favor, intente más tarde.';
  } finally {
    loading.value = false;
  }
};

// Obtener el icono correspondiente a la especie de la mascota
const getMascotaEmoji = (especie) => {
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
  
  // Determinar si es hoy
  const fechaCita = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaCita.getTime() === hoy.getTime()) {
    return `Hoy, ${hora || 'hora no disponible'}`;
  }
  
  // Formatear fecha para mostrar
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long'
  }).format(fechaCita) + (hora ? `, ${hora}` : '');
};
</script>

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
        <!-- Header section -->
        <header class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p class="mt-1 text-gray-600">Bienvenido de nuevo, {{ authStore.user?.nombreUsuario || 'Usuario' }}</p>
            </div>
            <div class="mt-4 md:mt-0 flex space-x-3">
              <button class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  Hoy
                </span>
              </button>
              <button class="bg-teal-600 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Nueva Cita
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
        </div>

        <div v-else>
          <!-- Stats Grid -->
          <div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(stat, index) in statistics" :key="index" class="bg-white rounded-xl overflow-hidden shadow-sm">
              <div class="p-5">
                <div class="flex items-center">
                  <div :class="[stat.color, 'rounded-lg p-3']">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path :d="stat.icon"></path>
                    </svg>
                  </div>
                  <div class="ml-5">
                    <p class="text-gray-500 text-sm">{{ stat.name }}</p>
                    <h3 class="text-xl font-bold text-gray-800">{{ stat.value }}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Services Grid -->
          <h2 class="text-xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div v-for="(service, index) in services" :key="index" :class="[service.color, 'group bg-white rounded-xl border overflow-hidden shadow-sm transition-transform hover:scale-105 transform']">
              <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-3xl">{{ service.icon }}</div>
                  <div class="h-8 w-8 rounded-full bg-white shadow-inner flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">{{ service.precio }}</span>
                  </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ service.name }}</h3>
                <p class="text-sm text-gray-600">{{ service.description }}</p>
              </div>
            </div>
          </div>

          <!-- Appointments Section -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Próximas Citas</h2>
            </div>
            <div class="p-6">
              <div v-if="proximasCitas.length === 0" class="text-center py-8 text-gray-500">
                No hay citas programadas próximamente.
              </div>
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(cita, index) in proximasCitas" :key="index">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-10 w-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                            <span class="text-lg">{{ getMascotaEmoji(cita.mascota?.especie) }}</span>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ cita.mascota?.nombre || 'Sin nombre' }}</div>
                            <div class="text-sm text-gray-500">{{ cita.mascota?.raza || cita.mascota?.especie || 'Especie no especificada' }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ cita.cliente?.nombre || 'No registrado' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatFechaCita(cita.fecha, cita.hora) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ cita.servicio?.nombre || 'No especificado' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getEstadoCitaClass(cita.estado)]">{{ cita.estado || 'Pendiente' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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