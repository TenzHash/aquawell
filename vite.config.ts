import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Replace 'aquawell' with your exact GitHub repository name! If deploying to a custom domain or user root, leave as '/'
})