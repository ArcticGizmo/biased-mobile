import vue from '@vitejs/plugin-vue';
import path from 'path';
import { type ViteDevServer, defineConfig, Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import * as fs from 'node:fs';

type Reply = <T = any>(data: T) => void;
type Reject = <T = any>(error: T) => void;
interface MsgPayload<T> {
  id: string;
  data: T;
}

const addMessageHandler = <ReqData = any>(
  server: ViteDevServer,
  name: string,
  handle: (req: ReqData, reply: Reply, reject: Reject) => void
) => {
  server.hot.on(`${name}:request`, (req: MsgPayload<ReqData>) => {
    console.log('[vite msg] request', req);
    const reply = (data: any) => server.hot.send(`${name}:response`, { id: req.id, ok: true, data });
    const reject = (error: any) => server.hot.send(`${name}:response`, { id: req.id, ok: false, error });
    handle(req.data, reply, reject);
  });
};

const viteStoragePlugin = (): Plugin => {
  return {
    name: 'ViteMesaging',
    configureServer(server) {
      if (!fs.existsSync('./vite-storage')) {
        fs.mkdirSync('./vite-storage');
      }

      addMessageHandler<{ key: string; value: any }>(server, 'storage:save', async (req, reply, reject) => {
        fs.writeFile(`./.vite-storage/${req.key}.txt`, JSON.stringify(req.value), { flag: 'w+' }, err => {
          if (err) {
            console.error('[vite storage] error while saving', req.key, err);
            reject(err);
          } else {
            console.log('[vite storage] save |', req.key);
            reply('ok');
          }
        });
      });

      addMessageHandler<{ key: string }>(server, 'storage:load', (req, reply, reject) => {
        fs.readFile(`./.vite-storage/${req.key}.txt`, 'utf8', (err, data) => {
          if (err) {
            // TODO: catch file does not exist
            console.error('[vite storage] error while laoding', req.key, err);
            reject(err);
          } else {
            console.log('[vite storage load |', req.key);
            reply(data);
          }
        });
      });
    }
  };
};

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
    port: 8100
  }
});
