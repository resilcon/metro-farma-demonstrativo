import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base relativa: o build funciona em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages, SharePoint…)
export default defineConfig({ base: './', plugins: [react(), tailwindcss()], build: { chunkSizeWarningLimit: 900 } });
