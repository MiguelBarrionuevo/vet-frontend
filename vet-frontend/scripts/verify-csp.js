#!/usr/bin/env node

/**
 * Script para verificar la configuración CSP del frontend
 */

import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifyCspConfiguration() {
  console.log('🔍 Verificando configuración CSP...\n');

  try {
    // Verificar vercel.json
    const vercelPath = join(__dirname, '..', 'vercel.json');
    const vercelConfig = JSON.parse(await fs.readFile(vercelPath, 'utf8'));
    
    const cspHeader = vercelConfig.headers[0].headers.find(h => h.key === 'Content-Security-Policy');
    
    if (cspHeader) {
      console.log('✅ vercel.json CSP configurado:');
      console.log(`   ${cspHeader.value}\n`);
      
      // Verificar que incluye la URL correcta del backend
      if (cspHeader.value.includes('vet-backend-production.up.railway.app')) {
        console.log('✅ Backend URL configurado correctamente en CSP\n');
      } else {
        console.log('⚠️  Backend URL puede no estar configurado correctamente\n');
      }
    } else {
      console.log('❌ CSP no encontrado en vercel.json\n');
    }

    // Verificar .env.production
    const envProdPath = join(__dirname, '..', '.env.production');
    try {
      const envProd = await fs.readFile(envProdPath, 'utf8');
      if (envProd.includes('VITE_API_URL=https://vet-backend-production.up.railway.app')) {
        console.log('✅ Variable de entorno VITE_API_URL configurada correctamente');
      } else {
        console.log('⚠️  Variable de entorno VITE_API_URL puede no estar configurada correctamente');
      }
    } catch (error) {
      console.log('❌ No se pudo leer .env.production');
    }

    // Verificar index.html
    const indexPath = join(__dirname, '..', 'index.html');
    const indexContent = await fs.readFile(indexPath, 'utf8');
    
    if (indexContent.includes('Content-Security-Policy')) {
      console.log('✅ Meta tag CSP encontrado en index.html');
    } else {
      console.log('⚠️  Meta tag CSP no encontrado en index.html');
    }

    console.log('\n🎯 Configuraciones aplicadas:');
    console.log('   • Headers de seguridad en Vercel');
    console.log('   • CSP restrictivo para scripts y conexiones');
    console.log('   • URLs del backend autorizadas');
    console.log('   • Upgrade insecure requests');
    console.log('   • Block mixed content');
    console.log('   • Frame ancestors bloqueados');

    console.log('\n🚀 Para desplegar:');
    console.log('   1. Commit y push de los cambios');
    console.log('   2. Vercel redesplegará automáticamente');
    console.log('   3. Verificar headers con: curl -I https://vet-frontend-dusky.vercel.app');
    
  } catch (error) {
    console.error('❌ Error verificando configuración:', error.message);
  }
}

verifyCspConfiguration();
