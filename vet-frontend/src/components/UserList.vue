<script setup>
import { ref, onMounted, computed } from 'vue';
import { userService } from '../services/api';
import Sidebar from './Sidebar.vue'; // Importar Sidebar
import { useAuthStore } from '../stores/auth'; // Importar AuthStore
import { useRouter } from 'vue-router'; // Importar Router

const authStore = useAuthStore(); // Usar AuthStore
const router = useRouter(); // Usar Router
const users = ref([]);
const loading = ref(true);
const error = ref(null);
const searchTerm = ref('');
const isSidebarOpen = ref(false); // Estado para el sidebar móvil

// Cargar usuarios al montar
onMounted(async () => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  try {
    const response = await userService.getUsers();
    // La respuesta ya contiene los usuarios con rolNombre
    users.value = response.data || [];
    console.log('Usuarios cargados:', users.value); // Log para verificar datos
  } catch (err) {
    console.error('Error cargando usuarios:', err);
    error.value = 'No se pudieron cargar los usuarios.';
  } finally {
    loading.value = false;
  }
});

// Filtrar usuarios según el término de búsqueda (usando rolNombre)
const filteredUsers = computed(() => {
  if (!searchTerm.value) {
    return users.value;
  }
  const lowerSearchTerm = searchTerm.value.toLowerCase();
  return users.value.filter(user =>
    user.nombreUsuario.toLowerCase().includes(lowerSearchTerm) ||
    user.correo.toLowerCase().includes(lowerSearchTerm) ||
    (user.rolNombre && user.rolNombre.toLowerCase().replace('role_', '').includes(lowerSearchTerm)) || // Buscar en rolNombre formateado
    (user.especialidad && user.especialidad.toLowerCase().includes(lowerSearchTerm))
  );
});

// Formatear nombre del rol (usando rolNombre)
const formatRoleName = (roleName) => {
  if (!roleName) return 'N/A';
  // Limpiar prefijo y reemplazar guiones bajos si es necesario
  return roleName.replace(/^ROLE_/, '').replace('_', ' ');
};

// Funciones para Sidebar
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
        <header class="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Lista de Usuarios</h1>
            <p class="mt-1 text-gray-600">Usuarios registrados en el sistema.</p>
          </div>
           <!-- Barra de búsqueda -->
           <div class="mt-4 md:mt-0">
             <input
               type="text"
               v-model="searchTerm"
               placeholder="Buscar por nombre, correo, rol..."
               class="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
             />
           </div>
        </header>

        <!-- Indicador de carga -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>

        <!-- Mensaje de error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 mb-8">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{{ error }}</p>
          </div>
        </div>

        <!-- Tabla de usuarios -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
           <div v-if="filteredUsers.length === 0" class="text-center py-8 text-gray-500">
             No se encontraron usuarios que coincidan con la búsqueda o no hay usuarios registrados.
           </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Usuario</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id">
                  <!-- ... Nombre Usuario y Correo ... -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ user.nombreUsuario }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ user.correo }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                     <!-- Usar user.rolNombre para clases y texto -->
                     <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                           :class="{
                             'bg-blue-100 text-blue-800': user.rolNombre === 'ROLE_ADMIN',
                             'bg-green-100 text-green-800': user.rolNombre === 'ROLE_VETERINARIO',
                             'bg-yellow-100 text-yellow-800': user.rolNombre === 'ROLE_EMPLEADO',
                             'bg-gray-100 text-gray-800': !user.rolNombre
                           }">
                       {{ formatRoleName(user.rolNombre) }}
                     </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.especialidad || '-' }}
                  </td>
                   <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <!-- Aquí irían botones para editar/eliminar si se implementan -->
                     <a href="#" class="text-teal-600 hover:text-teal-900 mr-3">Editar</a>
                     <a href="#" class="text-red-600 hover:text-red-900">Eliminar</a>
                   </td>
                </tr>
              </tbody>
            </table>
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
