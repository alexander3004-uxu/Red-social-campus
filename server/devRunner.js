/**
 * server/devRunner.js
 * Ejecutor simultáneo para desarrollo local:
 * Inicia el backend (Express + WebSockets, puerto 4000) y el frontend (Vite, puerto 3000)
 * con un solo comando `npm run dev`.
 */

import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Iniciando Red Social Campus (Backend + Frontend)...');

// 1. Iniciar Servidor Backend Express en puerto 4000
const serverProc = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '4000' },
});

// 2. Iniciar Cliente Vite en puerto 3000
const viteProc = spawn('npx', ['vite', '--port=3000', '--host=0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
});

// Manejo de cierre limpio
const cleanExit = () => {
  serverProc.kill();
  viteProc.kill();
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
