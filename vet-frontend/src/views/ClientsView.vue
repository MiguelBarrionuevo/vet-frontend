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
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
          <p class="mt-1 text-gray-600">Administra los clientes y sus mascotas.</p>
        </header>

        <!-- Vista principal (lista de clientes) -->
        <div v-if="currentView === 'list'">
          <ClientList 
            :clients="clients" 
            :loading="loading" 
            :error="error"
            @add-client="showAddClientForm"
            @edit-client="showEditClientForm"
            @delete-client="deleteClient"
            @view-client="showClientDetails"
            @view-client-pets="showClientPets"
          />
        </div>

        <!-- Vista de formulario de cliente (crear/editar) -->
        <div v-else-if="currentView === 'form'">
          <ClientForm 
            :cliente="selectedClient" 
            :isSubmitting="submitting"
            @submit="saveClient"
            @cancel="currentView = 'list'"
          />
        </div>

        <!-- Vista de detalles de cliente -->
        <div v-else-if="currentView === 'details'">
          <ClientDetails 
            :cliente="selectedClient" 
            :mascotas="petsByClient"
            :loadingPets="loadingPets"
            :errorPets="errorPets"
            @edit-client="showEditClientForm"
            @add-pet="showAddPetForm"
            @edit-pet="showEditPetForm"
            @delete-pet="deletePet"
            @view-pet="showPetDetails"
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

        <!-- Vista de formulario de mascota (crear/editar) -->
        <div v-else-if="currentView === 'petForm'">
          <PetForm 
            :mascota="selectedPet"
            :clientePreseleccionado="selectedClient"
            :clientes="clients"
            :isSubmitting="submitting"
            @submit="savePet"
            @cancel="backToPreviousView"
          />
          <div class="mt-4 flex">
            <button 
              @click="backToPreviousView" 
              class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Cancelar
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';
import ClientList from '../components/clients/ClientList.vue';
import ClientForm from '../components/clients/ClientForm.vue';
import ClientDetails from '../components/clients/ClientDetails.vue';
import PetForm from '../components/pets/PetForm.vue';
import clientService from '../services/clientService';
import petService from '../services/petService';

const router = useRouter();
const authStore = useAuthStore();

// Estado general
const currentView = ref('list'); // 'list', 'form', 'details', 'petForm'
const previousView = ref('list'); // Para volver desde el formulario de mascotas
const isSidebarOpen = ref(false);
const selectedClient = ref({});
const selectedPet = ref({});
const submitting = ref(false);

// Estado para clientes
const clients = ref([]);
const loading = ref(true);
const error = ref(null);

// Estado para mascotas
const petsByClient = ref([]);
const loadingPets = ref(false);
const errorPets = ref(null);

// Verificar autenticación y cargar datos
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (!authStore.hasPermission('CLIENTE_READ')) {
    router.push('/dashboard');
    return;
  }
  
  loadClients();
});

// Cargar todos los clientes
const loadClients = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await clientService.getAllClientes();
    clients.value = data;
  } catch (err) {
    console.error('Error cargando clientes:', err);
    error.value = 'No se pudieron cargar los clientes. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Cargar mascotas de un cliente específico
const loadPetsByClient = async (clientId) => {
  loadingPets.value = true;
  errorPets.value = null;
  
  try {
    const data = await petService.getMascotasByClienteId(clientId);
    petsByClient.value = data;
  } catch (err) {
    console.error(`Error cargando mascotas del cliente ${clientId}:`, err);
    errorPets.value = 'No se pudieron cargar las mascotas. Por favor, intente nuevamente.';
  } finally {
    loadingPets.value = false;
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

const backToPreviousView = () => {
  currentView.value = previousView.value;
};

// Funciones para gestionar clientes
const showAddClientForm = () => {
  selectedClient.value = {};
  currentView.value = 'form';
};

const showEditClientForm = (cliente) => {
  selectedClient.value = { ...cliente };
  previousView.value = currentView.value; // Guardar la vista actual
  currentView.value = 'form';
};

const showClientDetails = async (cliente) => {
  selectedClient.value = { ...cliente };
  currentView.value = 'details';
  await loadPetsByClient(cliente.id);
};

const showClientPets = async (cliente) => {
  await showClientDetails(cliente);
};

const saveClient = async (clientData) => {
  submitting.value = true;
  
  try {
    if (clientData.id) {
      // Actualizar cliente existente
      const updatedClient = await clientService.updateCliente(clientData.id, clientData);
      const index = clients.value.findIndex(c => c.id === clientData.id);
      if (index !== -1) {
        clients.value[index] = updatedClient;
      }
    } else {
      // Crear nuevo cliente
      // Asegurarse de que existe fechaRegistro
      if (!clientData.fechaRegistro) {
        clientData.fechaRegistro = new Date().toISOString();
      }
      const newClient = await clientService.createCliente(clientData);
      clients.value.push(newClient);
    }
    
    currentView.value = 'list';
  } catch (err) {
    console.error('Error guardando cliente:', err);
    alert('Ocurrió un error al guardar el cliente.');
  } finally {
    submitting.value = false;
  }
};

const deleteClient = async (cliente) => {
  if (!confirm(`¿Está seguro de eliminar a ${cliente.nombre}? Esta acción también eliminará todas sus mascotas.`)) {
    return;
  }
  
  try {
    await clientService.deleteCliente(cliente.id);
    clients.value = clients.value.filter(c => c.id !== cliente.id);
  } catch (err) {
    console.error('Error eliminando cliente:', err);
    alert('Ocurrió un error al eliminar el cliente.');
  }
};

// Funciones para gestionar mascotas
const showAddPetForm = (cliente) => {
  selectedPet.value = {};
  selectedClient.value = cliente;
  previousView.value = currentView.value; // Guardar la vista actual
  currentView.value = 'petForm';
};

const showEditPetForm = (mascota) => {
  selectedPet.value = { ...mascota };
  previousView.value = currentView.value; // Guardar la vista actual
  currentView.value = 'petForm';
};

const showPetDetails = (mascota) => {
  // Implementar si se necesita una vista detallada de mascotas
  console.log('Ver detalles de mascota:', mascota);
};

const savePet = async (petData) => {
  submitting.value = true;
  
  try {
    // Asegurarse de que los datos de la mascota tienen el formato esperado por el backend
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
      const index = petsByClient.value.findIndex(p => p.id === mascotaData.id);
      if (index !== -1) {
        petsByClient.value[index] = updatedPet;
      }
    } else {
      // Crear nueva mascota
      const newPet = await petService.createMascota(mascotaData);
      petsByClient.value.push(newPet);
      
      // Actualizar el contador de mascotas en el cliente seleccionado
      const clientIndex = clients.value.findIndex(c => c.id === selectedClient.value.id);
      if (clientIndex !== -1) {
        // Si el cliente no tiene un contador de mascotas, inicializarlo en 0
        if (!clients.value[clientIndex].cantidadMascotas) {
          clients.value[clientIndex].cantidadMascotas = 0;
        }
        // Incrementar el contador
        clients.value[clientIndex].cantidadMascotas++;
        
        // Actualizar también el cliente seleccionado para que se refleje en la UI
        selectedClient.value = { ...clients.value[clientIndex] };
      }
    }
    
    currentView.value = previousView.value;
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
    await petService.deleteMascota(mascota.id);
    petsByClient.value = petsByClient.value.filter(p => p.id !== mascota.id);
    
    // Actualizar el contador de mascotas en el cliente seleccionado
    const clientIndex = clients.value.findIndex(c => c.id === selectedClient.value.id);
    if (clientIndex !== -1 && clients.value[clientIndex].cantidadMascotas > 0) {
      // Decrementar el contador
      clients.value[clientIndex].cantidadMascotas--;
      
      // Actualizar también el cliente seleccionado para que se refleje en la UI
      selectedClient.value = { ...clients.value[clientIndex] };
    }
  } catch (err) {
    console.error('Error eliminando mascota:', err);
    alert('Ocurrió un error al eliminar la mascota.');
  }
};
</script>
