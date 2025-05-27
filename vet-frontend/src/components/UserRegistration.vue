<script setup>
import { ref, onMounted } from 'vue';
import { userService, roleService } from '../services/api';
import { useRouter } from 'vue-router';
import Sidebar from './Sidebar.vue'; // Importar Sidebar
import { useAuthStore } from '../stores/auth'; // Importar AuthStore

const router = useRouter();
const authStore = useAuthStore(); // Usar AuthStore

// Datos del formulario
const nombre = ref('');        // NUEVO  
const apellido = ref('');      // NUEVO  
const nombreUsuario = ref('');
const correo = ref('');
const contrasena = ref('');
const rolId = ref('');
const especialidad = ref(''); // Opcional para veterinarios
const isSidebarOpen = ref(false); // Estado para el sidebar móvil

// Estado
const roles = ref([]);
const loading = ref(false);
const error = ref(null);
const successMessage = ref('');
const showEspecialidad = ref(false); // Para mostrar/ocultar campo especialidad

// Función para generar nombre de usuario automáticamente  
const generateUsername = () => {  
  if (!nombre.value || !apellido.value || !rolId.value) return;  
    
  const selectedRole = roles.value.find(r => r.id === parseInt(rolId.value));  
  const roleName = selectedRole?.nombre || '';  
    
  let prefix = '';  
  switch (roleName) {  
    case 'ROLE_VETERINARIO':  
      prefix = 'vet';  
      break;  
    case 'ROLE_GERENTE':  
      prefix = 'ger';  
      break;  
    case 'ROLE_RECEPCIONISTA':  
      prefix = 'rec';  
      break;  
    case 'ROLE_ADMIN':  
    case 'ROLE_ADMIN_SISTEMA':  
    case 'ROLE_ADMIN_USUARIOS':  
      prefix = 'admin';  
      break;  
    default:  
      prefix = 'user';  
  }  
    
  const nombreLower = nombre.value.toLowerCase().replace(/\s+/g, '');  
  const apellidoLower = apellido.value.toLowerCase().replace(/\s+/g, '');  
  nombreUsuario.value = `${prefix}_${apellidoLower}_${nombreLower}`;  
};

// Errores de validación  
const errors = ref({  
  nombre: '',  
  apellido: '',  
  nombreUsuario: '',  
  correo: '',  
  contrasena: '',  
  rolId: ''  
});  

// Validar formulario  
const validateForm = () => {  
  let isValid = true;  
    
  // Reiniciar errores  
  Object.keys(errors.value).forEach(key => {  
    errors.value[key] = '';  
  });  
    
  // Validar nombre  
  if (!nombre.value.trim()) {  
    errors.value.nombre = 'El nombre es obligatorio';  
    isValid = false;  
  }  
    
  // Validar apellido  
  if (!apellido.value.trim()) {  
    errors.value.apellido = 'El apellido es obligatorio';  
    isValid = false;  
  }  
    
  // Validar nombre de usuario  
  if (!nombreUsuario.value.trim()) {  
    errors.value.nombreUsuario = 'El nombre de usuario es obligatorio';  
    isValid = false;  
  }  
    
  // Validar correo con estándar @vetcare.com  
  if (!correo.value.trim()) {  
    errors.value.correo = 'El correo electrónico es obligatorio';  
    isValid = false;  
  } else if (!correo.value.endsWith('@vetcare.com')) {  
    errors.value.correo = 'El correo debe terminar con @vetcare.com';  
    isValid = false;  
  } else if (!/^[^\s@]+@vetcare\.com$/.test(correo.value)) {  
    errors.value.correo = 'El formato del correo no es válido';  
    isValid = false;  
  }  
    
  // Validar contraseña  
  if (!contrasena.value) {  
    errors.value.contrasena = 'La contraseña es obligatoria';  
    isValid = false;  
  } else if (contrasena.value.length < 8) {  
    errors.value.contrasena = 'La contraseña debe tener al menos 8 caracteres';  
    isValid = false;  
  }  
    
  // Validar rol  
  if (!rolId.value) {  
    errors.value.rolId = 'Debe seleccionar un rol';  
    isValid = false;  
  }  
    
  return isValid;  
};  

// Cargar roles al montar
onMounted(async () => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  try {
    const response = await roleService.getRoles();
    roles.value = response.data || [];
    console.log('Roles cargados:', roles.value); // Log para verificar
  } catch (err) {
    console.error('Error cargando roles:', err);
    error.value = 'No se pudieron cargar los roles.';
  }
});

// Observar cambios en el rol seleccionado  
const handleRoleChange = () => {  
  const selectedRole = roles.value.find(r => r.id === parseInt(rolId.value));  
  // Ajusta 'ROLE_VETERINARIO' si el nombre del rol es diferente en la respuesta de /api/roles  
  showEspecialidad.value = selectedRole?.nombre === 'ROLE_VETERINARIO';  
  if (!showEspecialidad.value) {  
    especialidad.value = '';  
  }  
  generateUsername(); // Regenerar username cuando cambia el rol  
};  

// Manejar envío del formulario
const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = '';

  const userData = {
    nombre: nombre.value,                    // NUEVO  
    apellido: apellido.value,               // NUEVO  
    nombreUsuario: nombreUsuario.value,
    correo: correo.value,
    contrasena: contrasena.value,
    rolId: parseInt(rolId.value), // Asegurarse de que sea número
    ...(showEspecialidad.value && { especialidad: especialidad.value }) // Añadir especialidad si es visible
  };

  try {  
    await userService.register(userData);  
    successMessage.value = 'Usuario registrado exitosamente.';  
    // Limpiar formulario  
    nombre.value = '';  
    apellido.value = '';  
    nombreUsuario.value = '';  
    correo.value = '';  
    contrasena.value = '';  
    rolId.value = '';  
    especialidad.value = '';  
    showEspecialidad.value = false;  
    // Opcional: redirigir a la lista de usuarios  
    // router.push('/users');  
  } catch (err) {  
    console.error('Error registrando usuario:', err);  
    error.value = err.response?.data?.mensaje || 'Error al registrar el usuario. Verifique los datos.';  
  } finally {  
    loading.value = false;  
  }  
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
        <div></div> <!-- Placeholder -->  
      </div>  
  
      <main class="p-6 animate__animated animate__fadeIn">  
        <header class="bg-white rounded-xl shadow-sm p-6 mb-6">  
          <h1 class="text-2xl font-bold text-gray-800">Registrar Nuevo Usuario</h1>  
          <p class="mt-1 text-gray-600">Complete el formulario para añadir un nuevo miembro al equipo.</p>  
        </header>  
  
        <div class="bg-white rounded-xl shadow-sm p-6">  
          <form @submit.prevent="handleSubmit">  
            <!-- Mensaje de éxito -->  
            <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">  
              {{ successMessage }}  
            </div>  
            <!-- Mensaje de error -->  
            <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">  
              {{ error }}  
            </div>  
  
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">  
              <!-- Nombre (NUEVO) -->  
              <div>  
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>  
                <input  
                  type="text"  
                  id="nombre"  
                  v-model="nombre"  
                  @input="generateUsername"  
                  required  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"  
                  :class="{ 'border-red-300': errors.nombre }"  
                />  
                <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>  
              </div>  
  
              <!-- Apellido (NUEVO) -->  
              <div>  
                <label for="apellido" class="block text-sm font-medium text-gray-700 mb-1">Apellido*</label>  
                <input  
                  type="text"  
                  id="apellido"  
                  v-model="apellido"  
                  @input="generateUsername"  
                  required  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"  
                  :class="{ 'border-red-300': errors.apellido }"  
                />  
                <p v-if="errors.apellido" class="mt-1 text-sm text-red-600">{{ errors.apellido }}</p>  
              </div>  
  
              <!-- Nombre de Usuario (MODIFICADO) -->  
              <div>  
                <label for="nombreUsuario" class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario*</label>  
                <input  
                  type="text"  
                  id="nombreUsuario"  
                  v-model="nombreUsuario"  
                  readonly  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-600"  
                  placeholder="Se genera automáticamente"  
                />  
                <p class="mt-1 text-xs text-gray-500">Se genera automáticamente basado en el rol, nombre y apellido</p>  
                <p v-if="errors.nombreUsuario" class="mt-1 text-sm text-red-600">{{ errors.nombreUsuario }}</p>  
              </div>  
  
              <!-- Correo Electrónico (MODIFICADO) -->  
              <div>  
                <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico*</label>  
                <input  
                  type="email"  
                  id="correo"  
                  v-model="correo"  
                  required  
                  placeholder="usuario@vetcare.com"  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"  
                  :class="{ 'border-red-300': errors.correo }"  
                />  
                <p class="mt-1 text-xs text-gray-500">Debe terminar con @vetcare.com</p>  
                <p v-if="errors.correo" class="mt-1 text-sm text-red-600">{{ errors.correo }}</p>  
              </div>  
  
              <!-- Contraseña -->  
              <div>  
                <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-1">Contraseña*</label>  
                <input  
                  type="password"  
                  id="contrasena"  
                  v-model="contrasena"  
                  required  
                  minlength="8"  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"  
                  :class="{ 'border-red-300': errors.contrasena }"  
                  placeholder="Ejemplo: Enero2025@"  
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"  
                  title="Debe contener al menos una mayúscula, una minúscula, un número y un símbolo. Mínimo 8 caracteres."  
                />  
                <p class="mt-1 text-xs text-gray-500">Debe contener al menos una mayúscula, una minúscula, un número y un símbolo.</p>  
                <p v-if="errors.contrasena" class="mt-1 text-sm text-red-600">{{ errors.contrasena }}</p>  
              </div>  
  
              <!-- Rol -->  
              <div>  
                <label for="rol" class="block text-sm font-medium text-gray-700 mb-1">Rol*</label>  
                <select  
                  id="rol"  
                  v-model="rolId"  
                  @change="handleRoleChange"  
                  required  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"  
                  :class="{ 'border-red-300': errors.rolId }"  
                >  
                  <option value="" disabled>Seleccione un rol</option>  
                  <option v-for="rol in roles" :key="rol.id" :value="rol.id">  
                    {{ rol.nombre?.replace('ROLE_', '').replace('_', ' ') || `Rol ID: ${rol.id}` }}  
                  </option>  
                </select>  
                <p v-if="errors.rolId" class="mt-1 text-sm text-red-600">{{ errors.rolId }}</p>  
              </div>  
  
              <!-- Especialidad (Condicional) -->  
              <div v-if="showEspecialidad">  
                <label for="especialidad" class="block text-sm font-medium text-gray-700 mb-1">Especialidad (Veterinario)</label>  
                <input  
                  type="text"  
                  id="especialidad"  
                  v-model="especialidad"  
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"  
                  placeholder="Ej: Cardiología, Cirugía"  
                />  
              </div>  
            </div>  
  
            <!-- Botón de envío -->  
            <div class="mt-8 flex justify-end">  
              <button  
                type="submit"  
                :disabled="loading"  
                class="bg-teal-600 text-white px-6 py-2 rounded-lg shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"  
              >  
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">  
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>  
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>  
                </svg>  
                {{ loading ? 'Registrando...' : 'Registrar Usuario' }}  
              </button>  
            </div>  
          </form>  
        </div>  
         <!-- Footer -->  
        <footer class="mt-8 text-center">  
          <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Sistema de Gestión Veterinaria. Todos los derechos reservados.</p>  
        </footer>  
      </main>  
    </div>  
  </div>  
</template>
