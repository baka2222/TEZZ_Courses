import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Должно быть просто '/'
  build: {
    outDir: 'build', // Или 'dist' в зависимости от вашей настройки
    assetsDir: 'assets'
  }
})
