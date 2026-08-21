import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'teams': resolve(__dirname, 'teams.html'),
        'syllabus': resolve(__dirname, 'syllabus.html'),
        'leland-ai-builders-b2b': resolve(__dirname, 'leland-ai-builders-b2b.html'),
        'leland-ai-builders-b2b-vica': resolve(__dirname, 'leland-ai-builders-b2b-vica.html'),
        'reviews': resolve(__dirname, 'reviews.html'),
        'program': resolve(__dirname, 'program.html'),
        'program-for-teams': resolve(__dirname, 'program-for-teams.html'),
        'siliconslopes': resolve(__dirname, 'siliconslopes.html'),
        'scaling': resolve(__dirname, 'scaling.html'),
        'pledge': resolve(__dirname, 'pledge.html'),
        'recruit': resolve(__dirname, 'recruit.html'),
        'services': resolve(__dirname, 'services.html'),
      }
    }
  }
})
