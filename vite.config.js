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
        'level-1': resolve(__dirname, 'level-1.html'),
        'level-2': resolve(__dirname, 'level-2.html'),
        'level-3': resolve(__dirname, 'level-3.html'),
        'level-4': resolve(__dirname, 'level-4.html'),
        'level-5': resolve(__dirname, 'level-5.html'),
      }
    }
  }
})
