import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
  },
  test: {
    setupFiles: ['./tests/setup-env.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
})
