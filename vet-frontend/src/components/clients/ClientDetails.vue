<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Cabecera con información del cliente -->
    <div class="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center">
          <div class="h-16 w-16 rounded-full bg-white text-teal-800 flex items-center justify-center text-2xl font-bold">
            {{ getInitials(cliente) }}
          </div>
          <div class="ml-4 text-white">
            <h2 class="text-xl font-semibold">{{ getFullName(cliente) }}</h2>
            <p class="mt-1 text-teal-100">Cliente desde {{ formatDate(cliente.fechaRegistro) }}</p>
          </div>
        </div>
        <div class="mt-4 md:mt-0 flex space-x-2">
          <button 
            @click="$emit('edit-client', cliente)" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
          <button 
            @click="$emit('add-pet', cliente)" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Agregar Mascota
          </button>
        </div>
      </div>
    </div>
    
    <!-- Información de contacto -->
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Información de contacto</h3>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p class="text-sm font-medium text-gray-500">Teléfono</p>
          <p class="mt-1 text-gray-900">{{ cliente.telefono || 'No especificado' }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Correo</p>
          <p class="mt-1 text-gray-900">{{ cliente.correo || 'No especificado' }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Dirección</p>
          <p class="mt-1 text-gray-900">{{ cliente.direccion || 'No especificada' }}</p>
        </div>
      </div>
    </div>
    
    <!-- Notas adicionales -->
    <div v-if="cliente.notas" class="p-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Notas</h3>
      <p class="text-gray-700 whitespace-pre-line">{{ cliente.notas }}</p>
    </div>
    
    <!-- Lista de mascotas -->
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          Mascotas ({{ mascotas.length || cliente.cantidadMascotas || 0 }})
        </h3>
        <button 
          @click="$emit('add-pet', cliente)" 
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Agregar mascota
        </button>
      </div>
      
      <!-- Cargando mascotas -->
      <div v-if="loadingPets" class="py-4 flex justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
        <span class="ml-2 text-gray-500">Cargando mascotas...</span>
      </div>
      
      <!-- Error al cargar mascotas -->
      <div v-else-if="errorPets" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
        <p>{{ errorPets }}</p>
      </div>
      
      <!-- No hay mascotas -->
      <div v-else-if="mascotas.length === 0" class="py-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <p class="text-gray-500">Este cliente no tiene mascotas registradas.</p>
        <button 
          @click="$emit('add-pet', cliente)" 
          class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none"
        >
          Registrar su primera mascota
        </button>
      </div>
      
      <!-- Lista de mascotas -->
      <div v-else class="space-y-4">
        <div 
          v-for="mascota in mascotas" 
          :key="mascota.id" 
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          @click="$emit('view-pet', mascota)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-xl text-teal-800">
                {{ getEmojiForSpecies(mascota.especie) }}
              </div>
              <div class="ml-3">
                <h4 class="text-lg font-medium text-gray-900">{{ mascota.nombre }}</h4>
                <p class="text-sm text-gray-500">{{ mascota.especie }} · {{ mascota.raza || 'Raza no especificada' }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click.stop="$emit('edit-pet', mascota)" 
                class="text-gray-500 hover:text-teal-600"
                title="Editar mascota"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                @click.stop="$emit('delete-pet', mascota)" 
                class="text-gray-500 hover:text-red-600"
                title="Eliminar mascota"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  cliente: {
    type: Object,
    required: true
  },
  mascotas: {
    type: Array,
    default: () => []
  },
  loadingPets: {
    type: Boolean,
    default: false
  },
  errorPets: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['edit-client', 'add-pet', 'edit-pet', 'delete-pet', 'view-pet']);

// Obtener nombre completo del cliente
const getFullName = (cliente) => {
  if (!cliente) return '';
  return `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Sin nombre';
};

// Obtener iniciales del nombre
const getInitials = (cliente) => {
  if (!cliente) return '?';
  
  const firstInitial = cliente.nombre ? cliente.nombre.charAt(0) : '';
  const lastInitial = cliente.apellido ? cliente.apellido.charAt(0) : '';
  
  return (firstInitial + lastInitial).toUpperCase() || '?';
};

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'fecha desconocida';
  const date = new Date(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'fecha no válida';
  }
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Obtener emoji para cada especie
const getEmojiForSpecies = (especie) => {
  if (!especie) return '🐾';
  
  const especies = {
    'Perro': '🐶',
    'Gato': '🐱',
    'Ave': '🦜',
    'Conejo': '🐰',
    'Reptil': '🦎',
    'Pez': '🐠',
    'Hurón': '🐹',
    'Hamster': '🐹'
  };
  
  return especies[especie] || '🐾';
};
</script>
