<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const nombreUsuario = ref('');
const contrasena = ref('');
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  if (!nombreUsuario.value || !contrasena.value) {
    error.value = 'Por favor, complete todos los campos';
    return;
  }

  try {
    loading.value = true;
    await authStore.login({
      nombreUsuario: nombreUsuario.value,
      contrasena: contrasena.value
    });
    router.push('/dashboard');
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 animate__animated animate__fadeIn">
    <div class="max-w-md w-full bg-white rounded-xl shadow-xl p-10 space-y-8 transform transition-all duration-300 hover:shadow-2xl animate__animated animate__zoomIn animate__faster">
      <div class="text-center">
        <!-- Icono decorativo para la veterinaria -->
        <div class="mx-auto h-24 w-24 bg-teal-100 rounded-full flex items-center justify-center">
          <img src="https://img.icons8.com/fluency/48/000000/pet.png" alt="Logo" class="h-14 w-14" />
        </div>
        <h1 class="mt-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">VetCare</h1>
        <p class="mt-3 text-gray-500 text-sm">Gestión de pacientes y servicios veterinarios</p>
      </div>
      
      <div class="border-t border-gray-200 pt-5">
        <p class="text-center font-medium text-gray-700">Iniciar Sesión</p>
      </div>
      
      <form class="mt-4 space-y-6" @submit.prevent="handleLogin">
        <div v-if="error" 
          class="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-center animate__animated animate__shakeX">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-red-700">{{ error }}</span>
        </div>
        
        <div class="space-y-5">
          <div class="relative">
            <label for="nombreUsuario" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="nombreUsuario"
                v-model="nombreUsuario"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                placeholder="Ingrese su nombre de usuario"
              />
            </div>
          </div>
          
          <div class="relative">
            <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="contrasena"
                v-model="contrasena"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                placeholder="Ingrese su contraseña"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded">
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Recordarme
            </label>
          </div>
          <div class="text-sm">
            <a href="#" class="font-medium text-teal-600 hover:text-teal-500">
              ¿Olvidó su contraseña?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                   rounded-lg text-white font-medium bg-gradient-to-r from-teal-500 to-cyan-600
                   hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-teal-500 shadow-lg hover:shadow-xl
                   transition-all duration-300 transform hover:-translate-y-1 animate__animated animate__pulse animate__infinite animate__slower"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3" v-if="!loading">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-300 group-hover:text-teal-200" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
            <span v-else>Iniciar sesión</span>
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-sm">
        <p class="text-gray-600">
          Sistema de gestión veterinaria © {{ new Date().getFullYear() }}
        </p>
      </div>
    </div>
  </div>
</template>