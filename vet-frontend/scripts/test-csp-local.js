#!/usr/bin/env node

/**
 * Script para probar CSP localmente
 */

import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// CSP header para pruebas locales
const CSP_HEADER = 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com data:; " +
  "img-src 'self' data: blob: https:; " +
  "connect-src 'self' https://vet-backend-production.up.railway.app https://*.vercel.app; " +
  "frame-ancestors 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "upgrade-insecure-requests; " +
  "block-all-mixed-content;";

// Middleware para aplicar headers de seguridad
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP_HEADER);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// Servir archivos estáticos desde dist
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Manejar rutas SPA
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🔒 Servidor de prueba CSP ejecutándose en http://localhost:${PORT}`);
  console.log('📋 Headers de seguridad aplicados:');
  console.log('   • Content-Security-Policy');
  console.log('   • X-Frame-Options: DENY');
  console.log('   • X-Content-Type-Options: nosniff');
  console.log('   • Referrer-Policy: strict-origin-when-cross-origin');
  console.log('   • Permissions-Policy');
  console.log('\n💡 Para usar:');
  console.log('   1. npm run build');
  console.log('   2. node scripts/test-csp-local.js');
  console.log('   3. Abrir http://localhost:3000 y verificar en DevTools');
});
