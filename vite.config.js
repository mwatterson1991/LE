import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'level-1': resolve(__dirname, 'level-1/index.html'),
        'level-2': resolve(__dirname, 'level-2/index.html'),
        'level-3': resolve(__dirname, 'level-3/index.html'),
        'level-4': resolve(__dirname, 'level-4/index.html'),
        'level-5': resolve(__dirname, 'level-5/index.html'),
      }
    }
  }
})
