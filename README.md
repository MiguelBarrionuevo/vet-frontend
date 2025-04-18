# VetCare Frontend 🩺

![VetCare Logo](https://img.icons8.com/fluency/96/000000/pet.png) <!-- Puedes reemplazar esto con un logo real si lo tienes -->

Frontend de la aplicación **VetCare**, una plataforma web moderna diseñada para la gestión integral de clínicas veterinarias. Construida con Vue.js y Tailwind CSS, ofrece una interfaz de usuario intuitiva y reactiva para administrar pacientes, citas, servicios y usuarios del sistema.

## ✨ Características Principales

*   **Dashboard Interactivo:** Visualización rápida de estadísticas clave (pacientes atendidos, citas del día), servicios ofrecidos y próximas citas.
*   **Gestión de Usuarios:** Registro y listado de usuarios (Administradores, Veterinarios, Empleados) con control de acceso basado en roles.
*   **Autenticación Segura:** Sistema de inicio de sesión con tokens JWT.
*   **Diseño Responsivo:** Interfaz adaptable a diferentes tamaños de pantalla (escritorio, móvil).
*   **Componentes Reutilizables:** Uso de componentes Vue para una base de código mantenible y escalable.
*   **Integración con Backend:** Comunicación con una API REST para la gestión de datos.

## 🛠️ Tecnologías Utilizadas

*   **Framework Frontend:** [Vue.js](https://vuejs.org/) 3 (Composition API)
*   **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/)
*   **Enrutamiento:** [Vue Router](https://router.vuejs.org/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Cliente HTTP:** [Axios](https://axios-http.com/)
*   **Bundler:** [Vite](https://vitejs.dev/)
*   **Animaciones:** [Animate.css](https://animate.style/)

## 📋 Prerrequisitos

*   [Node.js](https://nodejs.org/) (v18 o superior recomendado)
*   [npm](https://www.npmjs.com/) (o [yarn](https://yarnpkg.com/))

## 🚀 Instalación y Ejecución Local

Sigue estos pasos para poner en marcha el proyecto en tu máquina:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/Crekold/vet-frontend.git
    ```
2.  **Navega al directorio del proyecto:**
    ```bash
    cd vet-frontend/vet-frontend
    ```
    *(Nota: Parece que el proyecto está dentro de otro directorio con el mismo nombre. Ajusta la ruta si es necesario)*
3.  **Instala las dependencias:**
    ```bash
    npm install
    ```
4.  **Configura la URL del Backend:**
    Asegúrate de que la `baseURL` en [`src/services/api.js`](c:\Users\epicg\OneDrive\Documentos\GitHub\vet-frontend\vet-frontend\src\services\api.js) apunte a tu instancia del backend en ejecución (por defecto es `http://localhost:8080`).
    ```javascript
    // filepath: src/services/api.js
    const api = axios.create({
      baseURL: 'http://localhost:8080', // <-- Verifica esta URL
      // ...
    });
    ```
5.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Esto iniciará la aplicación en modo de desarrollo con Hot-Module Replacement (HMR).

6.  **Abre tu navegador:**
    La aplicación debería estar disponible en `http://localhost:5173` (o el puerto que indique Vite en la terminal).

## 📦 Scripts Disponibles

Dentro del directorio del proyecto, puedes ejecutar los siguientes comandos:

*   `npm run dev`: Inicia el servidor de desarrollo con Vite.
*   `npm run build`: Compila y empaqueta la aplicación para producción en el directorio `dist/`.
*   `npm run preview`: Sirve localmente la build de producción desde el directorio `dist/`.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar VetCare Frontend, por favor sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz commit (`git commit -m "Agrega nueva funcionalidad"`).
4.  Sube tus cambios a tu fork (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request detallando tus cambios.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` (si existe) para más detalles.

---

¡Gracias por usar **VetCare Frontend**! Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.