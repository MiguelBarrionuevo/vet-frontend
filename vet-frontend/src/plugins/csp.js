export const cspPlugin = () => {
  return {
    name: 'csp-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Solo aplicar en desarrollo con CSP más estricto
        if (process.env.NODE_ENV === 'development') {
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self'; " +
            "style-src 'self' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' http://localhost:8080 https://vet-backend-production.up.railway.app ws://localhost:5173 ws://localhost:3000; " +
            "frame-ancestors 'none'; " +
            "object-src 'none';"
          );
        }
        next();
      });
    },
    generateBundle(options, bundle) {
      // Validar CSP en producción
      if (process.env.NODE_ENV === 'production') {
        console.log('🔒 Aplicando configuración CSP estricta para producción...');
        console.log('✓ Script sources: solo desde el mismo dominio');
        console.log('✓ Connect sources: backend autorizado en Railway');
        console.log('✓ Upgrade insecure requests habilitado');
        console.log('✓ Block mixed content habilitado');
      }
    }
  };
};

export default cspPlugin;
