<script setup>
import { ref, onMounted, computed } from 'vue';
import { userService } from '../services/api';
import Sidebar from './Sidebar.vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import UserForm from './users/UserForm.vue';

const authStore = useAuthStore();
const router = useRouter();
const users = ref([]);
const loading = ref(true);
const error = ref(null);
const searchTerm = ref('');
const isSidebarOpen = ref(false);
const showInactiveUsers = ref(false); // Nuevo estado para mostrar inactivos

// Estado para gestionar la vista actual (lista, edición, detalles)
const currentView = ref('list');
const selectedUser = ref({});
const submitting = ref(false);
const showDeleteConfirm = ref(false);
const userToDelete = ref(null);
const userToReactivate = ref(null); // Nuevo estado para reactivar
const showReactivateConfirm = ref(false); // Nuevo estado para confirmación de reactivación

// Cargar usuarios al montar
onMounted(async () => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Verificar permisos
  if (!authStore.hasPermission('USUARIO_READ')) {
    router.push('/dashboard');
    return;
  }
  
  await loadUsers();
});

// Función para cargar los usuarios
const loadUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await userService.getUsers();
    // Asegurarse de que todos los usuarios tengan la propiedad 'activo', por defecto true si no existe
    users.value = (response.data || []).map(user => ({
      ...user,
      activo: user.activo !== undefined ? user.activo : true // Asumir activo si no se especifica
    }));
    console.log('Usuarios cargados:', users.value);
  } catch (err) {
    console.error('Error cargando usuarios:', err);
    error.value = 'No se pudieron cargar los usuarios.';
  } finally {
    loading.value = false;
  }
};

// Filtrar usuarios según el término de búsqueda y estado 'activo'
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Filtrar por estado activo/inactivo
    if (!showInactiveUsers.value && !user.activo) {
      return false; // Ocultar inactivos si showInactiveUsers es false
    }

    // Filtrar por término de búsqueda
    if (searchTerm.value) {
      const lowerSearchTerm = searchTerm.value.toLowerCase();
      return (
        user.nombreUsuario?.toLowerCase().includes(lowerSearchTerm) ||
        user.correo?.toLowerCase().includes(lowerSearchTerm) ||
        (user.rolNombre && formatRoleName(user.rolNombre).toLowerCase().includes(lowerSearchTerm)) ||
        (user.especialidad && user.especialidad.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return true; // Mostrar si pasa el filtro de activo y no hay término de búsqueda
  });
});

// Formatear nombre del rol
const formatRoleName = (roleName) => {
  if (!roleName) return 'N/A';
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

// Funciones para gestionar usuarios
const showEditUserForm = (user) => {
  selectedUser.value = { ...user };
  currentView.value = 'form';
};

const showAddUserForm = () => {
  selectedUser.value = {};
  currentView.value = 'form';
};

const returnToList = () => {
  currentView.value = 'list';
  selectedUser.value = {};
};

// Guardar usuario (crear o actualizar)
const saveUser = async (userData) => {
  submitting.value = true;
  
  try {
    let savedUser;
    
    if (userData.id) {
      // Actualizar usuario existente
      savedUser = await userService.updateUser(userData.id, userData);
      const index = users.value.findIndex(u => u.id === userData.id);
      if (index !== -1) {
        users.value[index] = savedUser;
      }
    } else {
      // Crear nuevo usuario
      savedUser = await userService.register(userData);
      users.value.push(savedUser);
    }
    
    returnToList();
  } catch (err) {
    console.error('Error guardando usuario:', err);
    alert('Ocurrió un error al guardar el usuario. Por favor, revise los datos e intente nuevamente.');
  } finally {
    submitting.value = false;
  }
};

// Eliminar usuario (lógicamente)
const confirmDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    // La API debería manejar la lógica de poner activo=false
    await userService.deleteUser(userToDelete.value.id);

    // Actualizar localmente el estado del usuario a inactivo
    const index = users.value.findIndex(u => u.id === userToDelete.value.id);
    if (index !== -1) {
      users.value[index].activo = false;
    }

    showDeleteConfirm.value = false;
    userToDelete.value = null;
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    alert('Ocurrió un error al eliminar el usuario.');
    showDeleteConfirm.value = false; // Cerrar modal en caso de error también
  }
};

// Reactivar usuario
const confirmReactivateUser = (user) => {
  userToReactivate.value = user;
  showReactivateConfirm.value = true;
};

const reactivateUser = async () => {
  if (!userToReactivate.value) return;

  try {
    // Usar updateUser para reactivar (establecer activo=true)
    // Asegúrate de que el backend maneje esto correctamente
    const updatedUserData = { ...userToReactivate.value, activo: true };
    // No enviar contraseña al actualizar solo el estado activo
    delete updatedUserData.contrasena;

    const response = await userService.updateUser(userToReactivate.value.id, updatedUserData);

    // Actualizar localmente el estado del usuario a activo
    const index = users.value.findIndex(u => u.id === userToReactivate.value.id);
    if (index !== -1) {
      // Actualizar con los datos devueltos por la API si es necesario
      users.value[index] = { ...users.value[index], ...response, activo: true };
    }

    showReactivateConfirm.value = false;
    userToReactivate.value = null;
  } catch (err) {
    console.error('Error reactivando usuario:', err);
    alert('Ocurrió un error al reactivar el usuario.');
    showReactivateConfirm.value = false; // Cerrar modal en caso de error
  }
};

// Verificar permisos
const hasCreatePermission = computed(() => authStore.hasPermission('USUARIO_CREATE'));
const hasUpdatePermission = computed(() => authStore.hasPermission('USUARIO_UPDATE'));
const hasDeletePermission = computed(() => authStore.hasPermission('USUARIO_DELETE'));
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
        <!-- Vista de lista de usuarios -->
        <div v-if="currentView === 'list'">
          <header class="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Lista de Usuarios</h1>
              <p class="mt-1 text-gray-600">Usuarios registrados en el sistema.</p>
            </div>
            <div class="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
              <!-- Checkbox para mostrar inactivos -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="showInactive"
                  v-model="showInactiveUsers"
                  class="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label for="showInactive" class="ml-2 block text-sm text-gray-700">Mostrar inactivos</label>
              </div>
              <!-- Barra de búsqueda -->
              <input
                type="text"
                v-model="searchTerm"
                placeholder="Buscar..."
                class="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full md:w-auto"
              />
              <!-- Botón Nuevo Usuario -->
              <button
                v-if="hasCreatePermission"
                @click="showAddUserForm"
                class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center w-full md:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Nuevo Usuario
              </button>
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
              No se encontraron usuarios que coincidan con los filtros aplicados.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Usuario</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th> <!-- Nueva columna Estado -->
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- Aplicar clase condicional a la fila para usuarios inactivos -->
                  <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'bg-gray-100 text-gray-400': !user.activo }">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium" :class="{'text-gray-900': user.activo, 'line-through': !user.activo}">{{ user.nombreUsuario }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm" :class="{'text-gray-500': user.activo}">{{ user.correo }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            :class="{
                              'bg-blue-100 text-blue-800': user.rolNombre === 'ROLE_ADMIN' && user.activo,
                              'bg-green-100 text-green-800': user.rolNombre === 'ROLE_VETERINARIO' && user.activo,
                              'bg-yellow-100 text-yellow-800': user.rolNombre === 'ROLE_EMPLEADO' && user.activo,
                              'bg-gray-100 text-gray-800': !user.rolNombre && user.activo,
                              'bg-gray-200 text-gray-500': !user.activo // Estilo para rol inactivo
                            }">
                        {{ formatRoleName(user.rolNombre) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="{'text-gray-500': user.activo}">
                      {{ user.especialidad || '-' }}
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap"> <!-- Celda Estado -->
                      <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ user.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <!-- Botón Editar (siempre visible si hay permiso) -->
                        <button
                          v-if="hasUpdatePermission"
                          @click="showEditUserForm(user)"
                          :class="['hover:text-teal-900', user.activo ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600']"
                          title="Editar usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <!-- Botón Eliminar (solo si está activo y hay permiso) -->
                        <button
                          v-if="user.activo && hasDeletePermission"
                          @click="confirmDeleteUser(user)"
                          class="text-red-600 hover:text-red-900"
                          title="Eliminar usuario (lógico)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                        </button>
                        <!-- Botón Reactivar (solo si está inactivo y hay permiso de update) -->
                         <button
                          v-if="!user.activo && hasUpdatePermission"
                          @click="confirmReactivateUser(user)"
                          class="text-green-600 hover:text-green-900"
                          title="Reactivar usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modal de confirmación de eliminación -->
          <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar desactivación</h3>
              <p class="mb-4 text-gray-600">
                ¿Estás seguro de que deseas desactivar al usuario <strong>{{ userToDelete?.nombreUsuario }}</strong>?
                <br><span class="text-orange-600 text-sm">El usuario será marcado como inactivo pero no se eliminará permanentemente.</span>
              </p>
              <div class="flex justify-end space-x-3">
                <button @click="showDeleteConfirm = false; userToDelete = null" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
                <button @click="deleteUser" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Desactivar
                </button>
              </div>
            </div>
          </div>

           <!-- Modal de confirmación de reactivación -->
          <div v-if="showReactivateConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar reactivación</h3>
              <p class="mb-4 text-gray-600">
                ¿Estás seguro de que deseas reactivar al usuario <strong>{{ userToReactivate?.nombreUsuario }}</strong>?
              </p>
              <div class="flex justify-end space-x-3">
                <button @click="showReactivateConfirm = false; userToReactivate = null" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
                <button @click="reactivateUser" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Reactivar
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Vista de formulario de usuario (crear/editar) -->
        <div v-else-if="currentView === 'form'">
          <UserForm 
            :user="selectedUser" 
            :isSubmitting="submitting"
            @submit="saveUser"
            @cancel="returnToList"
          />
        </div>

        <!-- Footer -->
        <footer class="mt-8 text-center">
          <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Sistema de Gestión Veterinaria. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  </div>
</template>
