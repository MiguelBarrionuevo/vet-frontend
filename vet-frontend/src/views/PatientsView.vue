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
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Pacientes</h1>
          <p class="mt-1 text-gray-600">Administra las mascotas registradas en el sistema.</p>
        </header>

        <!-- Vista principal (lista de mascotas) -->
        <div v-if="currentView === 'list'">
          <PetList 
            :pets="pets" 
            :loading="loading" 
            :error="error"
            @add-pet="showAddPetForm"
            @edit-pet="showEditPetForm"
            @delete-pet="deletePet"
            @view-pet="viewPetDetails"
          />
        </div>

        <!-- Vista de formulario de mascota (crear/editar) -->
        <div v-else-if="currentView === 'form'">
          <PetForm 
            :mascota="selectedPet"
            :clientes="clients"
            :isSubmitting="submitting"
            @submit="savePet"
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
import PetList from '../components/pets/PetList.vue';
import PetForm from '../components/pets/PetForm.vue';
import petService from '../services/petService';
import { getAllClientes } from '../services/clientService';

const router = useRouter();
const authStore = useAuthStore();

// Estado general
const currentView = ref('list'); // 'list', 'form'
const isSidebarOpen = ref(false);
const selectedPet = ref({});
const submitting = ref(false);

// Estado para mascotas
const pets = ref([]);
const loading = ref(true);
const error = ref(null);

// Estado para clientes (necesario para el formulario)
const clients = ref([]);
const loadingClients = ref(false);

// Verificar autenticación y cargar datos
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (!authStore.hasPermission('MASCOTA_READ')) {
    router.push('/dashboard');
    return;
  }
  
  await Promise.all([loadPets(), loadClients()]);
});

// Cargar todas las mascotas
const loadPets = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await petService.getAllMascotas();
    pets.value = data;
  } catch (err) {
    console.error('Error cargando mascotas:', err);
    error.value = 'No se pudieron cargar las mascotas. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Cargar todos los clientes (para el select en el formulario)
const loadClients = async () => {
  loadingClients.value = true;
  
  try {
    // Llamar directamente a la función importada
    const data = await getAllClientes();
    clients.value = data;
  } catch (err) {
    console.error('Error cargando clientes:', err);
    // No mostrar error aquí, no es crítico para la vista principal
  } finally {
    loadingClients.value = false;
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

// Funciones para gestionar mascotas
const showAddPetForm = () => {
  selectedPet.value = {};
  currentView.value = 'form';
};

const showEditPetForm = (mascota) => {
  selectedPet.value = { ...mascota };
  currentView.value = 'form';
};

const viewPetDetails = (mascota) => {
  // Por ahora simplemente editar, pero podría ser una vista de detalles en el futuro
  showEditPetForm(mascota);
};

const savePet = async (petData) => {
  submitting.value = true;
  
  try {
    // Asegurarse de que los datos de la mascota tienen el formato esperado por el backend
    // Eliminar campos que no están en el modelo del backend si existen
    const mascotaData = {
      id: petData.id,
      nombre: petData.nombre,
      especie: petData.especie,
      raza: petData.raza,
      fechaNacimiento: petData.fechaNacimiento,
      sexo: petData.sexo,
      clienteId: petData.clienteId
    };
    
    if (mascotaData.id) {
      // Actualizar mascota existente
      const updatedPet = await petService.updateMascota(mascotaData.id, mascotaData);
      const index = pets.value.findIndex(p => p.id === mascotaData.id);
      if (index !== -1) {
        pets.value[index] = updatedPet;
      }
    } else {
      // Crear nueva mascota
      const newPet = await petService.createMascota(mascotaData);
      pets.value.push(newPet);
    }
    
    currentView.value = 'list';
  } catch (err) {
    console.error('Error guardando mascota:', err);
    alert('Ocurrió un error al guardar la mascota.');
  } finally {
    submitting.value = false;
  }
};

const deletePet = async (mascota) => {
  if (!confirm(`¿Está seguro de eliminar a ${mascota.nombre}?`)) {
    return;
  }
  
  try {
    const success = await petService.deleteMascota(mascota.id);
    if (success) {
      pets.value = pets.value.filter(p => p.id !== mascota.id);
    }
  } catch (err) {
    console.error('Error eliminando mascota:', err);
    alert('Ocurrió un error al eliminar la mascota.');
  }
};
</script>
