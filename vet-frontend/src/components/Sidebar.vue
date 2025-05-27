<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  user: Object,
  isSidebarOpen: Boolean 
});

const emit = defineEmits(['logout', 'toggle-sidebar']);
const authStore = useAuthStore();

// Nuevo estado para controlar si el sidebar está colapsado o expandido
const isCollapsed = ref(false); 

const handleLogout = () => {
  emit('logout');
};

// Función para alternar el estado colapsado
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  // Emitir evento para que los componentes puedan ajustarse al cambio
  emit('toggle-sidebar', isCollapsed.value);
};

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

// Clases computadas para el contenedor principal del sidebar
const sidebarClasses = computed(() => [
  'fixed', 'inset-y-0', 'left-0', 'bg-white', 'shadow-lg', 'z-20',
  'flex', 'flex-col',
  'transition-all', 'duration-300', 'ease-in-out',
  isCollapsed.value ? 'w-20' : 'w-64',
  props.isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 
  'lg:translate-x-0' 
]);

// Clases para los elementos de texto que deben ocultarse con una transición
const textClasses = computed(() => [
  'transition-all', 'duration-300', 'ease-in-out',
  'whitespace-nowrap', 'overflow-hidden',
  isCollapsed.value ? 'opacity-0 max-w-0 scale-0' : 'opacity-100 max-w-full scale-100'
]);

// Clases para los items de navegación (RouterLink)
const linkItemClasses = computed(() => [
  'group', 'flex', 'items-center', 'px-2', 'py-2', 'text-base', 'font-medium', 'rounded-md', 
  'text-gray-600', 'hover:bg-gray-100', 'hover:text-gray-900', 'transition-colors', 'duration-200',
  isCollapsed.value ? 'justify-center' : ''
]);

// Clases para el texto dentro de los items de navegación
const linkTextClasses = computed(() => [
  'transition-all', 'duration-300', 'ease-in-out', 
  'whitespace-nowrap', 'overflow-hidden',
  isCollapsed.value ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-4'
]);

// Clase específica para el contenedor del logo
const logoContainerClasses = computed(() => [
  'flex items-center', 
  isCollapsed.value ? 'justify-center' : ''
]);

// Clases para el botón de toggle en modo colapsado
const toggleButtonClasses = computed(() => [
  'w-full mt-2 text-gray-500 hover:bg-gray-100 p-2 rounded-md',
  'focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200',
  isCollapsed.value && 'lg:flex lg:justify-center', 
  !isCollapsed.value && 'lg:hidden'
]);
</script>

<template>
  <aside :class="sidebarClasses">
    <div class="flex flex-col h-full overflow-hidden relative"> 
      
      <!-- Cabecera del Sidebar sin el botón de colapsar en la esquina -->
      <div :class="['relative h-16 bg-gradient-to-r from-teal-500 to-cyan-600 shrink-0', isCollapsed ? 'px-2' : 'px-4']">
        <div :class="['flex items-center h-full', isCollapsed ? 'justify-center' : '']">
           <img src="../assets/pet.png" alt="Logo" class="h-10 w-10 shrink-0" />
           <span :class="['text-white text-xl font-bold ml-2', textClasses]">VetCare</span>
        </div>
      </div>
      
      <!-- Navegación Principal -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <!-- Información del Usuario -->
        <div :class="['mb-4', isCollapsed ? 'px-2' : 'px-4']">
          <div :class="['bg-teal-50 rounded-lg p-3 flex items-center', isCollapsed ? 'justify-center' : '']">
            <div class="bg-teal-100 rounded-full p-2 shrink-0" :class="[isCollapsed ? '' : 'mr-3']">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div :class="['overflow-hidden transition-all duration-300 ease-in-out', isCollapsed ? 'w-0' : 'w-auto']">
              <p :class="['text-sm font-medium text-teal-800', textClasses]">{{ user?.nombreUsuario || 'Usuario' }}</p>
              <p :class="['text-xs text-teal-600', textClasses]">{{ userRoleDisplay }}</p>
            </div>
          </div>
        </div>
        
        <!-- Enlaces de Navegación -->
        <div class="space-y-1 px-2">
          <RouterLink
            to="/dashboard"
            :class="linkItemClasses"
            active-class="bg-teal-100 text-teal-700"
            :title="isCollapsed ? 'Dashboard' : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span :class="linkTextClasses">Dashboard</span>
          </RouterLink>
            <RouterLink
            v-if="authStore.isVeterinario || authStore.isGerente || authStore.isAdmin || authStore.hasPermission('PACIENTE_READ')"
            to="/patients"
            :class="linkItemClasses"
            active-class="bg-teal-100 text-teal-700"
             :title="isCollapsed ? 'Pacientes' : ''"
          >
             <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
             </svg>
            <span :class="linkTextClasses">Pacientes</span>
          </RouterLink>          <RouterLink
            v-if="authStore.isVeterinario || authStore.isGerente || authStore.isRecepcionista || authStore.isAdmin || authStore.isAdminVeterinaria || authStore.hasPermission('CLIENTE_READ')"
            to="/clients"
            :class="linkItemClasses"
            active-class="bg-teal-100 text-teal-700"
             :title="isCollapsed ? 'Clientes' : ''"
          >
             <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
               <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
             </svg>
            <span :class="linkTextClasses">Clientes</span>
          </RouterLink>
            <RouterLink
            v-if="authStore.isVeterinario || authStore.isGerente || authStore.isAdminVeterinaria || authStore.isRecepcionista || authStore.hasPermission('CITA_READ')"
            to="/appointments"
            :class="linkItemClasses"
            active-class="bg-teal-100 text-teal-700"
             :title="isCollapsed ? 'Citas' : ''"
          >
             <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
             </svg>
            <span :class="linkTextClasses">Citas</span>
          </RouterLink>
            <RouterLink
            v-if="authStore.isVeterinario || authStore.isGerente || authStore.isAdmin || authStore.isAdminVeterinaria || authStore.isRecepcionista || authStore.hasPermission('SERVICIO_READ')"
            to="/services"
            :class="linkItemClasses"
            active-class="bg-teal-100 text-teal-700"
             :title="isCollapsed ? 'Servicios' : ''"
          >
             <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
             </svg>
            <span :class="linkTextClasses">Servicios</span>
          </RouterLink>
            <!-- Sección de Administración con separador mejorado -->
          <div v-if="authStore.isAdmin || authStore.isAdminSistema || authStore.isAdminUsuarios || authStore.isAdminVeterinaria || authStore.isGerente || authStore.hasPermission('USUARIO_READ') || authStore.hasPermission('USUARIO_CREATE') || authStore.hasPermission('ROLE_READ')" 
               :class="['pt-4 mt-4 space-y-1 border-t border-gray-200', isCollapsed ? 'px-0' : 'px-2']">
             <h3 :class="['text-xs font-semibold text-gray-500 uppercase tracking-wider', isCollapsed ? 'text-center' : 'px-3', textClasses]" id="admin-headline">
                <span v-if="!isCollapsed">Administración</span>
                <span v-else class="block h-0.5 bg-gray-200 mx-auto w-8 mt-1 mb-2"></span> <!-- Separador visual en modo colapsado -->
             </h3>
             <RouterLink
                v-if="authStore.isAdminUsuarios || authStore.isAdminSistema || authStore.hasPermission('USUARIO_READ')"
                to="/users"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                 :title="isCollapsed ? 'Gestionar Usuarios' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span :class="linkTextClasses">Gestionar Usuarios</span>
             </RouterLink>
             <RouterLink
                v-if="authStore.isAdminUsuarios || authStore.isAdminSistema || authStore.hasPermission('USUARIO_CREATE')"
                to="/users/register"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                 :title="isCollapsed ? 'Registrar Usuario' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span :class="linkTextClasses">Registrar Usuario</span>
             </RouterLink>
             
             <RouterLink
                v-if="authStore.isAdminSistema || authStore.hasPermission('ROLE_READ')"
                to="/roles"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                 :title="isCollapsed ? 'Gestión de Roles' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span :class="linkTextClasses">Gestión de Roles</span>
             </RouterLink>
             <RouterLink  
                v-if="authStore.isAdminSistema || authStore.isAdmin"  
                to="/logs"  
                :class="linkItemClasses"  
                active-class="bg-teal-100 text-teal-700"  
                :title="isCollapsed ? 'Logs del Sistema' : ''"  
              >  
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">  
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clip-rule="evenodd" />  
                </svg>  
                <span :class="linkTextClasses">Logs del Sistema</span>  
              </RouterLink>
          </div>

          <!-- Sección específica para gestión administrativa -->
          <div v-if="authStore.isGerente || authStore.isAdminVeterinaria" 
               :class="['pt-4 mt-4 space-y-1 border-t border-gray-200', isCollapsed ? 'px-0' : 'px-2']">
             <h3 :class="['text-xs font-semibold text-gray-500 uppercase tracking-wider', isCollapsed ? 'text-center' : 'px-3', textClasses]" id="management-headline">
                <span v-if="!isCollapsed">Gestión</span>
                <span v-else class="block h-0.5 bg-gray-200 mx-auto w-8 mt-1 mb-2"></span> <!-- Separador visual en modo colapsado -->
             </h3>
             <RouterLink
                to="/inventory"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                :title="isCollapsed ? 'Inventario' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                </svg>
                <span :class="linkTextClasses">Inventario</span>
             </RouterLink>
             <RouterLink
                to="/business-stats"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                :title="isCollapsed ? 'Estadísticas' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span :class="linkTextClasses">Estadísticas</span>
             </RouterLink>
          </div>

          <!-- Sección para Consultores de Datos -->
          <div v-if="authStore.isConsultorDatos" 
               :class="['pt-4 mt-4 space-y-1 border-t border-gray-200', isCollapsed ? 'px-0' : 'px-2']">
             <h3 :class="['text-xs font-semibold text-gray-500 uppercase tracking-wider', isCollapsed ? 'text-center' : 'px-3', textClasses]" id="data-headline">
                <span v-if="!isCollapsed">Análisis de Datos</span>
                <span v-else class="block h-0.5 bg-gray-200 mx-auto w-8 mt-1 mb-2"></span> <!-- Separador visual en modo colapsado -->
             </h3>
             <RouterLink
                to="/reports/appointments"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                :title="isCollapsed ? 'Análisis de Citas' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span :class="linkTextClasses">Análisis de Citas</span>
             </RouterLink>
             <RouterLink
                to="/reports/services"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                :title="isCollapsed ? 'Análisis de Servicios' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <span :class="linkTextClasses">Análisis de Servicios</span>
             </RouterLink>
          </div>

          <!-- Sección específica para veterinarios -->
          <div v-if="authStore.isVeterinario" 
               :class="['pt-4 mt-4 space-y-1 border-t border-gray-200', isCollapsed ? 'px-0' : 'px-2']">
             <h3 :class="['text-xs font-semibold text-gray-500 uppercase tracking-wider', isCollapsed ? 'text-center' : 'px-3', textClasses]" id="vet-headline">
                <span v-if="!isCollapsed">Herramientas Clínicas</span>
                <span v-else class="block h-0.5 bg-gray-200 mx-auto w-8 mt-1 mb-2"></span> <!-- Separador visual en modo colapsado -->
             </h3>
             <RouterLink
                to="/medical-records"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                :title="isCollapsed ? 'Historias Clínicas' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
                <span :class="linkTextClasses">Historias Clínicas</span>
             </RouterLink>
             <RouterLink
                to="/treatments"
                :class="linkItemClasses"
                active-class="bg-teal-100 text-teal-700"
                :title="isCollapsed ? 'Tratamientos' : ''"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5 text-gray-500 group-[.router-link-active]:text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <span :class="linkTextClasses">Tratamientos</span>
             </RouterLink>
          </div>
        </div>
      </nav>
      
      <!-- Pie del Sidebar -->
      <div class="p-4 border-t border-gray-200 shrink-0">
        <!-- Botón de logout -->
        <button 
          @click="handleLogout" 
          :class="['flex items-center w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors', isCollapsed ? 'justify-center' : '']"
          :title="isCollapsed ? 'Cerrar sesión' : ''"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" :class="[isCollapsed ? '' : 'mr-2']" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l7.293 7.293a1 1 0 001.414-1.414L5.414 4H13a1 1 0 100-2H4a1 1 0 00-1 1zm14 4a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span :class="linkTextClasses">Cerrar sesión</span>
        </button>
        
        <!-- Botón para colapsar/expandir (mejorado y más visible) -->
        <div class="mt-4 flex justify-center">
          <button 
            @click="toggleCollapse" 
            class="text-gray-500 hover:text-teal-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            :title="isCollapsed ? 'Expandir menú' : 'Colapsar menú'"
          >
            <div class="flex items-center justify-center">
              <svg v-if="isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7" />
              </svg>
              <span v-if="!isCollapsed" class="ml-2 text-sm font-medium">Colapsar</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Estilos adicionales para manejar transiciones */
.max-w-0 {
  max-width: 0;
}
.max-w-full {
  max-width: 100%;
}
.scale-0 {
  transform: scale(0);
}
.scale-100 {
  transform: scale(1);
}
</style>