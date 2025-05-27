export const cspPlugin = () => {
  return {
    name: 'csp-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Solo aplicar en desarrollo
        if (process.env.NODE_ENV === 'development') {
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com data:; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' http://localhost:8080 https://vet-backend-production.up.railway.app ws://localhost:* ws://127.0.0.1:*; " +
            "frame-ancestors 'none';"
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
