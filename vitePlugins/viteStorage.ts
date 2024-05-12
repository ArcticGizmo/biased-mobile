import type { Plugin } from 'vite';
import { addMessageHandler } from './messageHandler';
import * as fs from 'node:fs';
import nodePath from 'node:path';

const DIR = './.vite-storage';

const buildPath = (path: string) => nodePath.join(DIR, path);

export const viteStoragePlugin = (): Plugin => {
  return {
    name: 'ViteStorage',
    configureServer(server) {
      if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
      }

      addMessageHandler<{ path: string; value: any }>(server, 'storage:save', async (req, reply, reject) => {
        const path = buildPath(req.path);
        fs.mkdirSync(nodePath.dirname(path), { recursive: true });
        fs.writeFile(path, JSON.stringify(req.value), { flag: 'w+' }, err => {
          if (err) {
            console.error('[vite storage] error while saving', path, err);
            reject(err);
          } else {
            console.log('[vite storage] save |', path);
            reply('ok');
          }
        });
      });

      addMessageHandler<{ path: string }>(server, 'storage:load', (req, reply, reject) => {
        const path = buildPath(req.path);
        fs.readFile(path, 'utf8', (err, data) => {
          if (err && err.code !== 'ENOENT') {
            // TODO: catch file does not exist
            console.error('[vite storage] error while laoding', path, err);
            reject(err);
          } else {
            console.log('[vite storage load |', path);
            reply(data);
          }
        });
      });
    }
  };
};
