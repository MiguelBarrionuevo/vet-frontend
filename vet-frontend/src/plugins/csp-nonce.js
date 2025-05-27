/**
 * Plugin Vite para CSP con nonces
 */

import crypto from 'crypto';

export function cspNoncePlugin() {
  return {
    name: 'csp-nonce-plugin',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, context) {
        if (context.server) {
          // Solo en desarrollo - generar nonce dinámico
          const nonce = crypto.randomBytes(16).toString('base64');
          
          // Agregar nonce a scripts y estilos si es necesario
          return html.replace(
            /<script(?![^>]*nonce)/g,
            `<script nonce="${nonce}"`
          );
        }
        return html;
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // CSP más estricta para desarrollo
        const nonce = crypto.randomBytes(16).toString('base64');
        res.setHeader(
          'Content-Security-Policy',
          `default-src 'self'; ` +
          `script-src 'self' 'wasm-unsafe-eval'; ` +
          `object-src 'none'; ` +
          `style-src 'self' https://fonts.googleapis.com; ` +
          `font-src 'self' https://fonts.gstatic.com; ` +
          `img-src 'self' data: blob:; ` +
          `connect-src 'self' http://localhost:8080 https://vet-backend-production.up.railway.app ws://localhost:*; ` +
          `frame-ancestors 'none';`
        );
        next();
      });
    }
  };
}

export default cspNoncePlugin;
