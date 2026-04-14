import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@mediapipe/pose': path.resolve(__dirname, 'src/mock-mediapipe.js'),
      '@mediapipe/pose/pose.js': path.resolve(__dirname, 'src/mock-mediapipe.js')
    }
  },
  optimizeDeps: {
    exclude: ['@mediapipe/pose']
  }
})
