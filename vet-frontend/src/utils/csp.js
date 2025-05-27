/**
 * Utilidades para Content Security Policy
 */

// Generar un nonce único para cada solicitud
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
}

// Configuración base de CSP
export const cspConfig = {
  development: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
    'img-src': ["'self'", "data:", "blob:", "https:"],
    'connect-src': ["'self'", "http://localhost:8080", "ws://localhost:*", "ws://127.0.0.1:*"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
    'img-src': ["'self'", "data:", "blob:", "https:"],
    'connect-src': ["'self'", "https://vet-backend-production.up.railway.app", "https://*.vercel.app"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': []
  }
};

// Construir string de CSP
export function buildCSPString(config) {
  return Object.entries(config)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

// Obtener configuración CSP según el entorno
export function getCSPConfig() {
  const env = import.meta.env.MODE || 'development';
  return cspConfig[env] || cspConfig.development;
}

// Añadir origen dinámicamente (útil para diferentes entornos)
export function addAllowedOrigin(directive, origin) {
  const config = getCSPConfig();
  if (config[directive] && !config[directive].includes(origin)) {
    config[directive].push(origin);
  }
  return config;
}

// Validar si una URL está permitida por CSP
export function isOriginAllowed(url, directive = 'connect-src') {
  const config = getCSPConfig();
  const origins = config[directive] || [];
  
  try {
    const urlObj = new URL(url);
    return origins.some(origin => {
      if (origin === "'self'") {
        return urlObj.origin === window.location.origin;
      }
      return origin.includes(urlObj.hostname) || urlObj.href.startsWith(origin);
    });
  } catch {
    return false;
  }
}

export default {
  generateNonce,
  cspConfig,
  buildCSPString,
  getCSPConfig,
  addAllowedOrigin,
  isOriginAllowed
};
