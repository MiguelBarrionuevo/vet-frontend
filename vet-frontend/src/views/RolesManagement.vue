<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';
import RolesPermissionsMatrix from '../components/RolesPermissionsMatrix.vue';

const authStore = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(false);

// Verificar autenticación al montar
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Verificar si el usuario tiene permisos para gestionar roles (usando el permiso correcto)
  if (!authStore.hasPermission('ROLE_READ')) {
    router.push('/dashboard');
    return;
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
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
              <h1 class="text-2xl font-bold text-gray-800">Administración de Roles y Permisos</h1>
              <p class="mt-1 text-gray-600">Gestiona los roles del sistema y sus respectivos permisos</p>
            </div>
            <div class="mt-4 md:mt-0">
              <button @click="router.push('/dashboard')" class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                  Volver al Dashboard
                </span>
              </button>
            </div>
          </div>
        </header>

        <!-- Matriz de Roles y Permisos -->
        <RolesPermissionsMatrix />

        <!-- Footer -->
        <footer class="mt-8 text-center">
          <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Sistema de Gestión Veterinaria. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  </div>
</template>
