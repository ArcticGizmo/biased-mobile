import type { Plugin } from 'vite';
import { addMessageHandler } from './messageHandler';
import * as fs from 'node:fs';

const DIR = './.vite-storage';

const getPath = (key: string) => `${DIR}/${key}.txt`;

export const viteStoragePlugin = (): Plugin => {
  return {
    name: 'ViteStorage',
    configureServer(server) {
      if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
      }

      addMessageHandler<{ key: string; value: any }>(server, 'storage:save', async (req, reply, reject) => {
        fs.writeFile(getPath(req.key), JSON.stringify(req.value), { flag: 'w+' }, err => {
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
        fs.readFile(getPath(req.key), 'utf8', (err, data) => {
          if (err && err.code !== 'ENOENT') {
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
