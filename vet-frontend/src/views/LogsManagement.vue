<template>  
  <div class="min-h-screen bg-gray-50">  
    <!-- Sidebar Component -->  
    <Sidebar  
      :user="authStore.user"  
      :isSidebarOpen="isSidebarOpen"  
      @logout="handleLogout"  
      @toggle-sidebar="handleSidebarToggle"  
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
          <img src="../assets/pet.png" alt="Logo" class="h-8 w-8 mr-2" />  
          <span class="text-gray-800 text-lg font-bold">VetCare</span>  
        </div>  
        <div></div>  
      </div>  
  
      <main class="p-6">  
        <LogsViewer />  
      </main>  
    </div>  
  </div>  
</template>  
  
<script setup>  
import { ref } from 'vue';  
import { useAuthStore } from '../stores/auth';  
import { useRouter } from 'vue-router';  
import Sidebar from '../components/Sidebar.vue';  
import LogsViewer from '../components/logs/LogsViewer.vue';  
  
const authStore = useAuthStore();  
const router = useRouter();  
const isSidebarOpen = ref(false);  
  
// Verificar autenticación y permisos al montar  
if (!authStore.isAuthenticated) {  
  router.push('/login');  
} else if (!authStore.isAdmin) {  
  router.push('/dashboard');  
}  
  
const handleLogout = () => {  
  authStore.logout();  
  router.push('/login');  
};  
  
const toggleSidebar = () => {  
  isSidebarOpen.value = !isSidebarOpen.value;  
};  
  
const handleSidebarToggle = (collapsed) => {  
  // Manejar el evento de colapso del sidebar si es necesario  
};  
</script>