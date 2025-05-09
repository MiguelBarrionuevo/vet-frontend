<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { roleService } from '../../services/api';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Estado
const roles = ref([]);
const loading = ref(false);
const error = ref(null);
const showEspecialidad = ref(false);
const showPasswordField = ref(!props.user.id); // Mostrar campo de contraseña solo para nuevos usuarios

// Datos del formulario
const formData = reactive({
  id: props.user.id || null,
  nombreUsuario: props.user.nombreUsuario || '',
  correo: props.user.correo || '',
  contrasena: '', // Solo se usa para nuevos usuarios
  rolId: props.user.rolId || '',
  especialidad: props.user.especialidad || ''
});

// Errores de validación
const errors = reactive({
  nombreUsuario: '',
  correo: '',
  contrasena: '',
  rolId: ''
});

// Título del formulario
const formTitle = computed(() => {
  return props.user.id ? 'Editar Usuario' : 'Nuevo Usuario';
});

// Cargar roles al montar
onMounted(async () => {
  try {
    loading.value = true;
    const response = await roleService.getRoles();
    roles.value = response.data || [];
    
    // Si hay un rol seleccionado, verificar si debe mostrar el campo de especialidad
    if (formData.rolId) {
      handleRoleChange();
    }
  } catch (err) {
    console.error('Error cargando roles:', err);
    error.value = 'No se pudieron cargar los roles.';
  } finally {
    loading.value = false;
  }
});

// Manejar cambio de rol
const handleRoleChange = () => {
  const selectedRole = roles.value.find(r => r.id === parseInt(formData.rolId));
  showEspecialidad.value = selectedRole?.nombre === 'ROLE_VETERINARIO';
  if (!showEspecialidad.value) {
    formData.especialidad = '';
  }
};

// Validar formulario
const validateForm = () => {
  let isValid = true;
  
  // Reiniciar errores
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validar nombre de usuario
  if (!formData.nombreUsuario.trim()) {
    errors.nombreUsuario = 'El nombre de usuario es obligatorio';
    isValid = false;
  }
  
  // Validar correo
  if (!formData.correo.trim()) {
    errors.correo = 'El correo electrónico es obligatorio';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
    errors.correo = 'El correo electrónico no es válido';
    isValid = false;
  }
  
  // Validar contraseña (solo para nuevos usuarios)
  if (!props.user.id && !formData.contrasena) {
    errors.contrasena = 'La contraseña es obligatoria';
    isValid = false;
  } else if (!props.user.id && formData.contrasena.length < 8) {
    errors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    isValid = false;
  }
  
  // Validar rol
  if (!formData.rolId) {
    errors.rolId = 'Debe seleccionar un rol';
    isValid = false;
  }
  
  return isValid;
};

// Manejar envío del formulario
const handleSubmit = () => {
  if (!validateForm()) return;
  
  const userData = {
    ...formData,
    rolId: parseInt(formData.rolId)
  };
  
  // Si es edición y no se ha cambiado la contraseña, no enviarla
  if (props.user.id && !formData.contrasena) {
    delete userData.contrasena;
  }
  
  emit('submit', userData);
};
</script>

<template>
  <div>
    <!-- Encabezado -->
    <header class="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ formTitle }}</h1>
        <p class="mt-1 text-gray-600">{{ user.id ? 'Actualizar información de usuario' : 'Registrar nuevo usuario en el sistema' }}</p>
      </div>
      <button 
        @click="$emit('cancel')" 
        class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Volver
        </span>
      </button>
    </header>

    <!-- Formulario -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <!-- Indicador de carga de roles -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        <span class="ml-2 text-gray-500">Cargando datos...</span>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
        {{ error }}
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nombre de Usuario -->
          <div>
            <label for="nombreUsuario" class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario*</label>
            <input
              type="text"
              id="nombreUsuario"
              v-model="formData.nombreUsuario"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <!-- Correo Electrónico -->
          <div>
            <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico*</label>
            <input
              type="email"
              id="correo"
              v-model="formData.correo"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <!-- Contraseña (solo para nuevos usuarios o cambio explícito) -->
          <div>
            <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-1">Contraseña*</label>
            <input
              type="password"
              id="contrasena"
              v-model="formData.contrasena"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ejemplo: Enero2025@"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
              title="Debe contener al menos una mayúscula, una minúscula, un número y un símbolo. Mínimo 8 caracteres."
            />
            <p class="mt-1 text-xs text-gray-500">Debe contener al menos una mayúscula, una minúscula, un número y un símbolo.</p>

          </div>

          <!-- Opción para cambiar contraseña (solo para usuarios existentes) -->
          <div v-if="user.id && !showPasswordField" class="md:col-span-2">
            <button 
              type="button" 
              @click="showPasswordField = true"
              class="text-teal-600 hover:text-teal-800 text-sm"
            >
              + Cambiar contraseña
            </button>
          </div>

          <!-- Rol -->
          <div>
            <label for="rol" class="block text-sm font-medium text-gray-700 mb-1">Rol*</label>
            <select
              id="rol"
              v-model="formData.rolId"
              @change="handleRoleChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="" disabled>Seleccione un rol</option>
              <option v-for="rol in roles" :key="rol.id" :value="rol.id">
                {{ rol.nombre?.replace('ROLE_', '').replace('_', ' ') || `Rol ID: ${rol.id}` }}
              </option>
            </select>
          </div>

          <!-- Especialidad (Condicional) -->
          <div v-if="showEspecialidad">
            <label for="especialidad" class="block text-sm font-medium text-gray-700 mb-1">Especialidad (Veterinario)</label>
            <input
              type="text"
              id="especialidad"
              v-model="formData.especialidad"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: Cardiología, Cirugía"
            />
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none disabled:opacity-50 flex items-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Guardando...' : (user.id ? 'Actualizar Usuario' : 'Crear Usuario') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
