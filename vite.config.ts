import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { viteStoragePlugin } from './vitePlugins/viteStorage';
import { CorsProxy } from './vitePlugins/corsProxy';

const apiProxy = new CorsProxy('/proxy');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('cropper-')
        }
      }
    }),
    checker({ vueTsc: true }),
    viteStoragePlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // for test ultis
    // setupFiles: ['tests/unit/unit.setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  },
  server: {
    proxy: {
      ...apiProxy.entry()
    }
  }
});
