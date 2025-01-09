import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['aos']
        }
      }
    },
    assets: {
      inline: true
    }
  }
})