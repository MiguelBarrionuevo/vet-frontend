<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  user: Object,
  isSidebarOpen: Boolean
});

const emit = defineEmits(['logout']);

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
  <aside :class="['fixed inset-y-0 left-0 bg-white shadow-lg z-20 w-64 transform transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0']">
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-teal-500 to-cyan-600">
        <img src="https://img.icons8.com/fluency/48/000000/pet.png" alt="Logo" class="h-10 w-10 mr-2" />
        <span class="text-white text-xl font-bold">VetCare</span>
      </div>
      
      <nav class="flex-1 overflow-y-auto py-4">
        <div class="px-4 mb-4">
          <div class="bg-teal-50 rounded-lg p-3 flex items-center">
            <div class="bg-teal-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-teal-800">{{ user?.nombreUsuario || 'Usuario' }}</p>
              <p class="text-xs text-teal-600">Veterinario</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-1 px-2">
          <a href="#" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-teal-700 bg-teal-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-4 h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </a>
          
          <a href="#" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-4 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            Pacientes
          </a>
          
          <a href="#" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-4 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
            Citas
          </a>
          
          <a href="#" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-4 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Servicios
          </a>
          
          <a href="#" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-4 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
            </svg>
            Facturación
          </a>
          
          <a href="#" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-4 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            Informes
          </a>
        </div>
      </nav>
      
      <div class="p-4 border-t border-gray-200">
        <button 
          @click="handleLogout" 
          class="flex items-center justify-center w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 12.586V6z" clip-rule="evenodd" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  </aside>
</template>