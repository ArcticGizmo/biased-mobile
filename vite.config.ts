import vue from '@vitejs/plugin-vue';
import path from 'path';
import { type ViteDevServer, defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

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
    {
      name: 'ViteMesaging',
      configureServer(server) {
        addMessageHandler(server, 'store', (req, reply) => {
          console.log(req);
          reply('apples');
        });
      }
    }
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
