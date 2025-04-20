<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Header con buscador -->
    <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Lista de Mascotas</h2>
      <div class="flex items-center w-full sm:w-auto">
        <div class="relative flex-grow">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Buscar por nombre, especie o raza"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <button
          @click="$emit('add-pet')"
          class="ml-3 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nueva Mascota
        </button>
      </div>
    </div>
    
    <!-- Indicador de carga -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      <span class="ml-2 text-gray-500">Cargando mascotas...</span>
    </div>
    
    <!-- Mensaje de error -->
    <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p class="font-medium">Error al cargar las mascotas</p>
      <p>{{ error }}</p>
    </div>
    
    <!-- Mensaje sin resultados -->
    <div v-else-if="filteredPets.length === 0" class="py-8 text-center text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      <p v-if="searchTerm">No se encontraron mascotas que coincidan con "{{ searchTerm }}"</p>
      <p v-else>No hay mascotas registradas. ¡Agrega una nueva!</p>
    </div>
    
    <!-- Tabla de mascotas -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascota</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especie/Raza</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Información</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="mascota in filteredPets" :key="mascota.id" class="hover:bg-gray-50 cursor-pointer" @click="viewDetails(mascota)">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-lg">
                  {{ getEmojiForSpecies(mascota.especie) }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ mascota.nombre }}</div>
                  <div class="text-xs text-gray-500">{{ getAge(mascota.fechaNacimiento) }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ mascota.especie || 'No especificada' }}</div>
              <div class="text-xs text-gray-500">{{ mascota.raza || 'Raza no especificada' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ getClienteFullName(mascota) || 'No asignado' }}</div>
              <div class="text-xs text-gray-500">{{ mascota.clienteTelefono || '' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <span v-if="mascota.sexo" class="px-2 py-1 text-xs rounded-full" :class="mascota.sexo === 'Macho' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'">
                  {{ mascota.sexo }}
                </span>
                <!-- Eliminados color y peso que no están en el modelo del backend -->
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button @click.stop="$emit('edit-pet', mascota)" class="text-teal-600 hover:text-teal-900" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button @click.stop="confirmDelete(mascota)" class="text-red-600 hover:text-red-900" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="mb-4 text-gray-600">
          ¿Estás seguro de que deseas eliminar a <span class="font-semibold">{{ petToDelete?.nombre }}</span>?
          <br><span class="text-red-600 text-sm">Esta acción no se puede deshacer.</span>
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="deletePet" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  pets: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['add-pet', 'edit-pet', 'delete-pet', 'view-pet']);

const searchTerm = ref('');
const showDeleteModal = ref(false);
const petToDelete = ref(null);

// Filtrar mascotas según término de búsqueda
const filteredPets = computed(() => {
  if (!searchTerm.value) {
    return props.pets;
  }
  
  const term = searchTerm.value.toLowerCase();
  return props.pets.filter(mascota => {
    // Obtener el nombre completo del cliente
    const clienteFullName = getClienteFullName(mascota).toLowerCase();
    
    return (
      (mascota.nombre && mascota.nombre.toLowerCase().includes(term)) ||
      (mascota.especie && mascota.especie.toLowerCase().includes(term)) ||
      (mascota.raza && mascota.raza.toLowerCase().includes(term)) ||
      clienteFullName.includes(term)
    );
  });
});

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
    'Hamster': '🐹',
    'Otro': '🐾'
  };
  
  return especies[especie] || '🐾';
};

// Calcular edad aproximada basada en la fecha de nacimiento
const getAge = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'Edad desconocida';
  
  const birthDate = new Date(fechaNacimiento);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  if (years > 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const days = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }
};

// Ver detalles de la mascota
const viewDetails = (mascota) => {
  emit('view-pet', mascota);
};

// Confirmar eliminación
const confirmDelete = (mascota) => {
  petToDelete.value = mascota;
  showDeleteModal.value = true;
};

// Eliminar mascota
const deletePet = () => {
  emit('delete-pet', petToDelete.value);
  showDeleteModal.value = false;
  petToDelete.value = null;
};

// Función para obtener el nombre completo del cliente
const getClienteFullName = (mascota) => {
  if (!mascota) return '';
  return `${mascota.clienteNombre || ''} ${mascota.clienteApellido || ''}`.trim();
};
</script>
