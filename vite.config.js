import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'amharic-tool' below if your repository name is different.
export default defineConfig({
  plugins: [react()],
  base: '/amharic-tool/',
})