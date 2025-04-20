<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <svg class="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 class="mt-4 text-3xl font-bold text-gray-900">Página no encontrada</h1>
      <p class="mt-2 text-base text-gray-500">Lo sentimos, la página que estás buscando no existe o está en construcción.</p>
      <div class="mt-6">
        <router-link to="/dashboard" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No se requiere lógica adicional
</script>
