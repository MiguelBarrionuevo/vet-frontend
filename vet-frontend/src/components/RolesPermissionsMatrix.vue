<script setup>
import { ref, onMounted, computed } from 'vue';
import roleService from '../services/roleService';

// Estados
const roles = ref([]);
const permissions = ref([]);
const loading = ref(true);
const error = ref(null);
const matrix = ref({}); // Estructura: { roleId: { permissionId: boolean } }
const successMessage = ref('');
const errorMessage = ref('');
const showNewRoleForm = ref(false);
const newRoleName = ref('');
const newRoleDescription = ref('');
const editingRoleId = ref(null);
const editRoleName = ref('');
const editRoleDescription = ref('');
const showDeleteConfirm = ref(false);
const roleToDelete = ref(null);

// Cargar datos iniciales
onMounted(async () => {
  try {
    loading.value = true;
    await fetchRoles();
    await fetchPermissions();
    await buildMatrix();
  } catch (err) {
    error.value = 'Error al cargar los datos: ' + (err.message || 'Desconocido');
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Métodos
const fetchRoles = async () => {
  try {
    const response = await roleService.getAllRoles();
    roles.value = response.data;
  } catch (err) {
    console.error('Error obteniendo roles:', err);
    throw err;
  }
};

const fetchPermissions = async () => {
  try {
    const response = await roleService.getAllPermissions();
    permissions.value = response.data;
  } catch (err) {
    console.error('Error obteniendo permisos:', err);
    throw err;
  }
};

// Modificar el método buildMatrix para depurar y manejar correctamente la respuesta
const buildMatrix = async () => {
  const matrixData = {};
  
  if (!roles.value || !permissions.value) {
    console.error('Los roles o permisos no están disponibles');
    return;
  }
  
  // Depuración: mostrar todos los roles y permisos cargados
  console.log('Roles disponibles:', roles.value);
  console.log('Permisos disponibles:', permissions.value);
  
  for (const role of roles.value) {
    if (!role || !role.id) continue; // Saltar roles sin ID
    
    matrixData[role.id] = {};
    try {
      const response = await roleService.getRolePermissions(role.id);
      console.log(`Permisos para rol ${role.id} (${role.name || role.nombre || 'sin nombre'}):`);
      console.log('Datos originales:', response.data);
      
      // Inicializar todos los permisos en false
      permissions.value.forEach(permission => {
        if (!permission || !permission.id) return; // Saltar permisos sin ID
        matrixData[role.id][permission.id] = false;
      });
      
      // Procesar los permisos según el formato de la respuesta
      const rolePermissions = response.data;
      
      if (Array.isArray(rolePermissions)) {
        console.log(`${role.id} tiene permisos en formato array:`, rolePermissions);
        
        // La respuesta puede ser un array de IDs de permisos o objetos completos
        rolePermissions.forEach(permItem => {
          try {
            let permissionId;
            
            if (typeof permItem === 'number' || typeof permItem === 'string') {
              // Si es un número o string directo (ID del permiso)
              permissionId = permItem;
              console.log(`- Permiso ID (directo): ${permissionId}`);
            } else if (permItem && typeof permItem === 'object') {
              // Si es un objeto, buscar el ID en diferentes propiedades posibles
              permissionId = permItem.id || permItem.permissionId || permItem.permission_id;
              console.log(`- Permiso ID (objeto): ${permissionId}, objeto completo:`, permItem);
            }
            
            if (permissionId) {
              // Convertir a string para comparación consistente
              const permIdStr = String(permissionId);
              
              // Buscar si este ID existe en nuestros permisos disponibles
              const permExists = permissions.value.some(p => String(p.id) === permIdStr);
              
              if (permExists) {
                console.log(`  - Marcando permiso ${permIdStr} como activo para rol ${role.id}`);
                matrixData[role.id][permissionId] = true;
              } else {
                console.warn(`  - Permiso ${permIdStr} no encontrado en la lista de permisos disponibles`);
              }
            }
          } catch (err) {
            console.error('Error procesando permiso individual:', err);
          }
        });
      } else if (rolePermissions && typeof rolePermissions === 'object') {
        // Si la respuesta es un objeto con propiedades que son los permisos
        // Por ejemplo: { "1": true, "2": true }
        console.log(`${role.id} tiene permisos en formato objeto:`, rolePermissions);
        
        Object.keys(rolePermissions).forEach(permId => {
          try {
            if (matrixData[role.id] && rolePermissions[permId]) {
              console.log(`- Marcando permiso ${permId} como activo para rol ${role.id}`);
              matrixData[role.id][permId] = true;
            }
          } catch (err) {
            console.error('Error procesando permiso de objeto:', err);
          }
        });
      }
      
    } catch (err) {
      console.error(`Error obteniendo permisos para el rol ${role.id}:`, err);
    }
  }
  
  matrix.value = matrixData;
  console.log("Matriz final:", matrix.value); // Depuración
};

// Verificar que togglePermission también use correctamente los IDs
const togglePermission = async (roleId, permissionId) => {
  try {
    console.log(`Alternando permiso ${permissionId} para rol ${roleId}`);
    
    if (!matrix.value || !matrix.value[roleId]) {
      showErrorMessage('Error: información de matriz no disponible');
      return;
    }
    
    const currentState = matrix.value[roleId][permissionId] || false;
    console.log(`Estado actual: ${currentState}`);
    
    if (currentState) {
      // Revocar permiso
      console.log(`Revocando permiso ${permissionId} del rol ${roleId}`);
      await roleService.revokePermissionFromRole(roleId, permissionId);
    } else {
      // Asignar permiso
      console.log(`Asignando permiso ${permissionId} al rol ${roleId}`);
      await roleService.assignPermissionToRole(roleId, permissionId);
    }
    
    // Actualizar la matriz localmente
    matrix.value[roleId][permissionId] = !currentState;
    
    showSuccessMessage('Permisos actualizados correctamente');
  } catch (err) {
    showErrorMessage('Error al actualizar el permiso: ' + (err.message || 'Desconocido'));
    console.error('Error en togglePermission:', err);
  }
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

const createNewRole = async () => {
  if (!newRoleName.value.trim()) {
    showErrorMessage('El nombre del rol es obligatorio');
    return;
  }
  
  try {
    const newRole = {
      name: newRoleName.value.trim(),
      description: newRoleDescription.value.trim()
    };
    
    const response = await roleService.createRole(newRole);
    
    // Actualizar la lista de roles
    roles.value.push(response.data);
    
    // Inicializar este rol en la matriz
    matrix.value[response.data.id] = {};
    permissions.value.forEach(permission => {
      matrix.value[response.data.id][permission.id] = false;
    });
    
    // Limpiar formulario
    newRoleName.value = '';
    newRoleDescription.value = '';
    showNewRoleForm.value = false;
    
    showSuccessMessage('Rol creado correctamente');
  } catch (err) {
    showErrorMessage('Error al crear el rol: ' + (err.message || 'Desconocido'));
    console.error(err);
  }
};

const startEditRole = (role) => {
  editingRoleId.value = role.id;
  editRoleName.value = role.name;
  editRoleDescription.value = role.description || '';
};

const cancelEditRole = () => {
  editingRoleId.value = null;
  editRoleName.value = '';
  editRoleDescription.value = '';
};

const updateRole = async (roleId) => {
  if (!editRoleName.value.trim()) {
    showErrorMessage('El nombre del rol es obligatorio');
    return;
  }
  
  try {
    const updatedRole = {
      name: editRoleName.value.trim(),
      description: editRoleDescription.value.trim()
    };
    
    await roleService.updateRole(roleId, updatedRole);
    
    // Actualizar la lista de roles localmente
    const index = roles.value.findIndex(r => r.id === roleId);
    if (index !== -1) {
      roles.value[index] = { 
        ...roles.value[index], 
        name: updatedRole.name, 
        description: updatedRole.description 
      };
    }
    
    cancelEditRole();
    showSuccessMessage('Rol actualizado correctamente');
  } catch (err) {
    showErrorMessage('Error al actualizar el rol: ' + (err.message || 'Desconocido'));
    console.error(err);
  }
};

const confirmDeleteRole = (role) => {
  roleToDelete.value = role;
  showDeleteConfirm.value = true;
};

const deleteRole = async () => {
  if (!roleToDelete.value) return;
  
  try {
    await roleService.deleteRole(roleToDelete.value.id);
    
    // Eliminar el rol de la lista local
    roles.value = roles.value.filter(r => r.id !== roleToDelete.value.id);
    
    // Eliminar el rol de la matriz
    delete matrix.value[roleToDelete.value.id];
    
    showDeleteConfirm.value = false;
    roleToDelete.value = null;
    showSuccessMessage('Rol eliminado correctamente');
  } catch (err) {
    showErrorMessage('Error al eliminar el rol: ' + (err.message || 'Desconocido'));
    console.error(err);
  }
};

// Propiedades computadas modificadas para mayor seguridad
const sortedRoles = computed(() => {
  if (!roles.value || roles.value.length === 0) return [];
  
  return [...roles.value].sort((a, b) => {
    // Verificar si las propiedades existen antes de compararlas
    const nameA = a.name || a.nombre || '';
    const nameB = b.name || b.nombre || '';
    return nameA.toString().localeCompare(nameB.toString());
  });
});

const sortedPermissions = computed(() => {
  if (!permissions.value || permissions.value.length === 0) return [];
  
  return [...permissions.value].sort((a, b) => {
    // Verificar si las propiedades existen antes de compararlas
    const nameA = a.name || '';
    const nameB = b.name || '';
    return nameA.toString().localeCompare(nameB.toString());
  });
});

// Nueva función para mostrar IDs largos de forma más legible (opcional)
const formatId = (id) => {
  if (id && id.toString().length > 10) {
    return id.toString().substring(0, 3) + '...' + id.toString().slice(-3);
  }
  return id;
};

// Método para obtener de forma segura las propiedades de un objeto
const getProperty = (obj, prop, defaultValue = '') => {
  if (!obj) return defaultValue;
  return obj[prop] !== undefined ? obj[prop] : defaultValue;
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800">Gestión de Roles y Permisos</h2>
    </div>
    
    <!-- Mensajes de éxito/error -->
    <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 p-4 m-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-4 m-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center p-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="p-6 text-red-500">
      {{ error }}
    </div>
    
    <div v-else class="p-6">
      <!-- Acciones para los roles -->
      <div class="mb-6 flex justify-between items-center">
        <h3 class="text-md font-medium text-gray-700">Roles disponibles</h3>
        <button 
          @click="showNewRoleForm = !showNewRoleForm" 
          class="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          {{ showNewRoleForm ? 'Cancelar' : 'Nuevo Rol' }}
        </button>
      </div>
      
      <!-- Formulario para nuevo rol -->
      <div v-if="showNewRoleForm" class="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 class="text-md font-medium text-gray-700 mb-4">Crear nuevo rol</h4>
        <form @submit.prevent="createNewRole">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del rol *</label>
            <input 
              v-model="newRoleName" 
              type="text" 
              class="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Ej: Administrador, Veterinario, Recepcionista"
              required
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              v-model="newRoleDescription" 
              class="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Describe las responsabilidades de este rol"
              rows="2"
            ></textarea>
          </div>
          <div class="flex justify-end">
            <button 
              type="button" 
              @click="showNewRoleForm = false" 
              class="mr-2 bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
      
      <!-- Modal de confirmación para eliminar rol -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
          <p class="text-sm text-gray-500 mb-4">
            ¿Estás seguro de que deseas eliminar el rol "{{ roleToDelete?.name }}"? Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end">
            <button 
              @click="showDeleteConfirm = false; roleToDelete = null" 
              class="mr-2 bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              @click="deleteRole" 
              class="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Matriz de roles y permisos -->
      <div class="overflow-x-auto">
        <table v-if="sortedRoles.length && sortedPermissions.length" class="min-w-full border border-gray-200 divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64 sticky left-0 bg-gray-50 z-10 border-r">
                Roles / Permisos
              </th>
              <th 
                v-for="permission in sortedPermissions" 
                :key="permission.id" 
                scope="col" 
                class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :title="getProperty(permission, 'description')"
              >
                {{ getProperty(permission, 'name') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="role in sortedRoles" :key="role.id">
              <!-- Celda del rol (primera columna) -->
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-white z-10 border-r">
                <div v-if="editingRoleId === role.id" class="flex flex-col space-y-2">
                  <input 
                    v-model="editRoleName" 
                    type="text" 
                    class="shadow-sm text-sm focus:ring-teal-500 focus:border-teal-500 block w-full border-gray-300 rounded-md"
                    placeholder="Nombre del rol"
                  >
                  <div class="flex space-x-2 mt-1">
                    <button 
                      @click="updateRole(role.id)" 
                      class="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded"
                    >
                      Guardar
                    </button>
                    <button 
                      @click="cancelEditRole" 
                      class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                <div v-else class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">{{ getProperty(role, 'name') || getProperty(role, 'nombre') }}</div>
                    <div v-if="getProperty(role, 'description')" class="text-xs text-gray-500">{{ getProperty(role, 'description') }}</div>
                  </div>
                  <div class="flex space-x-1">
                    <button 
                      @click="startEditRole(role)" 
                      class="text-gray-400 hover:text-gray-600"
                      title="Editar rol"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      @click="confirmDeleteRole(role)" 
                      class="text-gray-400 hover:text-red-600"
                      title="Eliminar rol"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </td>
              
              <!-- Celdas de permisos -->
              <td 
                v-for="permission in sortedPermissions" 
                :key="`${role.id}-${permission.id}`"
                class="px-2 py-2 whitespace-nowrap text-center"
              >
                <div class="flex justify-center items-center">
                  <input 
                    type="checkbox" 
                    :checked="matrix[role.id]?.[permission.id] || false"
                    @change="togglePermission(role.id, permission.id)"
                    class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </td>
            </tr>
            
            <!-- Mensaje si no hay roles -->
            <tr v-if="sortedRoles.length === 0">
              <td colspan="100%" class="px-6 py-4 text-center text-sm text-gray-500">
                No hay roles disponibles. Crea un nuevo rol para comenzar.
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Mensaje si no hay datos para mostrar -->
        <div v-else class="p-6 text-center text-gray-500">
          No hay datos suficientes para mostrar la matriz de roles y permisos.
        </div>
      </div>
      
      <!-- Leyenda de permisos -->
      <div v-if="sortedPermissions.length" class="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Leyenda de permisos</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="permission in sortedPermissions" :key="`legend-${permission.id}`" class="text-xs">
            <span class="font-medium">{{ getProperty(permission, 'name') }}:</span>
            <span class="text-gray-600">{{ getProperty(permission, 'description', 'Sin descripción') }}</span>
          </div>
        </div>
      </div>
      
      <!-- Notas adicionales -->
      <div class="mt-4 text-sm text-gray-500">
        <p>* Los cambios en los permisos se guardan automáticamente al marcar o desmarcar las casillas.</p>
      </div>
    </div>
  </div>

</template>

<style scoped>
/* Estilos para la tabla con cabecera fija */
.sticky {
  position: sticky;
  background-color: white;
}

/* Añade un desplazamiento suave a los cambios */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
