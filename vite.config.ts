import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pour GitHub Pages : decommenter et ajuster le nom du repo
  // base: '/App_leave_network/',
})
