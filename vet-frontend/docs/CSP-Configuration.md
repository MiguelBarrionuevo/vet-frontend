# Configuración de Content Security Policy (CSP) 🔒

## 📋 Resumen

Este documento explica la implementación de Content Security Policy (CSP) para proteger la aplicación VetCare frontend contra vulnerabilidades de seguridad como XSS, inyección de código y ataques de clickjacking.

## 🛡️ Configuraciones Aplicadas

### 1. Headers en Vercel (`vercel.json`)

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://vet-backend-production.up.railway.app https://*.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;"
}
```

### 2. Headers Adicionales de Seguridad

- **X-Frame-Options**: `DENY` - Previene clickjacking
- **X-Content-Type-Options**: `nosniff` - Previene sniffing MIME
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Control de referrer
- **Permissions-Policy**: Deshabilita APIs sensibles
- **Strict-Transport-Security**: Fuerza HTTPS

### 3. Meta Tag en HTML (`index.html`)

Configuración CSP como respaldo en el meta tag del HTML.

## 🔧 Directivas CSP Explicadas

| Directiva | Valor | Propósito |
|-----------|-------|-----------|
| `default-src` | `'self'` | Solo recursos del mismo origen |
| `script-src` | `'self' 'unsafe-eval'` | Scripts del mismo origen + eval (requerido por Vue) |
| `style-src` | `'self' 'unsafe-inline' fonts.googleapis.com` | Estilos inline + Google Fonts |
| `font-src` | `'self' fonts.gstatic.com data:` | Fuentes del mismo origen + Google Fonts |
| `img-src` | `'self' data: blob: https:` | Imágenes flexibles para avatares/uploads |
| `connect-src` | `'self' backend.railway.app *.vercel.app` | Solo backend autorizado |
| `frame-ancestors` | `'none'` | Previene embedding en iframes |
| `base-uri` | `'self'` | Controla etiquetas &lt;base&gt; |
| `form-action` | `'self'` | Solo envío de formularios al mismo origen |

## 🚀 URLs del Backend

### Desarrollo
```
http://localhost:8080
```

### Producción
```
https://vet-backend-production.up.railway.app
```

## 📝 Scripts de Verificación

### Verificar Configuración
```bash
npm run verify-csp
```

### Probar CSP Localmente
```bash
npm run test-csp
```

## 🔍 Verificación Manual

### 1. Headers de Respuesta
```bash
curl -I https://vet-frontend-dusky.vercel.app
```

### 2. DevTools del Navegador
1. Abrir DevTools (F12)
2. Ir a la pestaña **Console**
3. Buscar warnings/errors de CSP
4. Ir a **Network** → **Headers** para verificar headers de respuesta

### 3. Herramientas Online
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)

## ⚠️ Problemas Comunes y Soluciones

### 1. Error: "Refused to execute inline script"
**Causa**: Scripts inline bloqueados por CSP
**Solución**: Mover scripts a archivos externos o usar nonces

### 2. Error: "Refused to connect to backend"
**Causa**: URL del backend no autorizada en `connect-src`
**Solución**: Verificar que la URL esté en la directiva `connect-src`

### 3. Error: "Refused to load font"
**Causa**: Fuente externa no autorizada
**Solución**: Añadir dominio a `font-src`

## 🔧 Comandos de Mantenimiento

### Actualizar URL del Backend
1. Editar `.env.production`
2. Actualizar `vercel.json`
3. Actualizar `src/utils/csp.js`
4. Correr `npm run verify-csp`

### Despliegue con CSP
```bash
# 1. Verificar configuración
npm run verify-csp

# 2. Build de producción
npm run build

# 3. Probar localmente (opcional)
npm run test-csp

# 4. Commit y push
git add .
git commit -m "feat: implement strict CSP configuration"
git push

# 5. Verificar en producción
curl -I https://vet-frontend-dusky.vercel.app
```

## 📊 Nivel de Seguridad Alcanzado

- ✅ **Prevención XSS**: Scripts bloqueados desde orígenes externos
- ✅ **Prevención Clickjacking**: Frame ancestors bloqueados
- ✅ **Conexiones Seguras**: Solo backend autorizado
- ✅ **Upgrade HTTPS**: Conexiones inseguras actualizadas automáticamente
- ✅ **Mixed Content**: Contenido mixto bloqueado
- ✅ **MIME Sniffing**: Prevenido por X-Content-Type-Options

## 🎯 Próximos Pasos

1. **Monitoreo CSP**: Implementar reporting de violaciones CSP
2. **Nonces Dinámicos**: Para scripts inline si es necesario
3. **Subresource Integrity**: Para recursos externos críticos
4. **Certificate Pinning**: Para conexiones al backend

---

**Nota**: Esta configuración balancea seguridad con funcionalidad. Para aplicaciones con requerimientos de seguridad extremos, considerar directivas aún más restrictivas.
