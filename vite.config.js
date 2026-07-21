/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import blitsVitePlugins from '@lightningjs/blits/vite'

export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    // Set VITE_BASE_PATH when deploying to a subdirectory (example: /myApp/)
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [...blitsVitePlugins],
    resolve: {
      mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      fs: {
        allow: ['..'],
      },
    },
    worker: {
      format: 'es',
    },
  }
})
