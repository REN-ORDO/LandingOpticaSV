import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        middlewareMode: false
    }
})
