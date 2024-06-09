import type { Plugin } from 'vite';
import { addMessageHandler } from './messageHandler';
import * as fs from 'node:fs';
import nodePath from 'node:path';

type FileEncoding = 'utf8' | 'base64';

const DIR = './.vite-storage';

const buildPath = (unsafePath: string) => {
  const safePath = nodePath.normalize(unsafePath).replace(/^(\.\.(\/|\\|$))+/, '');
  return nodePath.join(DIR, safePath);
};

export const viteStoragePlugin = (): Plugin => {
  return {
    name: 'ViteStorage',
    configureServer(server) {
      if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
      }

      addMessageHandler<{ path: string; value: string; encoding?: FileEncoding }>(server, 'storage:save', async (req, reply, reject) => {
        const path = buildPath(req.path);
        const encoding = req.encoding || 'utf8';

        fs.mkdirSync(nodePath.dirname(path), { recursive: true });

        if (encoding === 'utf8') {
          fs.writeFile(path, req.value, { flag: 'w+', encoding: 'utf8' }, err => {
            if (err) {
              console.error('[vite storage] error while saving', path, err);
              reject(err);
            } else {
              console.log('[vite storage] save |', path);
              reply('ok');
            }
          });
        } else {
          fs.writeFile(path, req.value.split(',')[1], { flag: 'w+', encoding: 'base64' }, err => {
            if (err) {
              console.error('[vite storage] error while saving', path, err);
              reject(err);
            } else {
              console.log('[vite storage] save |', path);
              reply('ok');
            }
          });
          reply('ok');
        }
      });

      addMessageHandler<{ path: string; encoding?: FileEncoding }>(server, 'storage:load', (req, reply, reject) => {
        const path = buildPath(req.path);
        const encoding = req.encoding || 'utf8';

        if (encoding === 'utf8') {
          fs.readFile(path, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
              // TODO: catch file does not exist
              console.error('[vite storage] error while loading', path, err);
              reject(err);
            } else {
              console.log('[vite storage] load |', path);
              reply(data);
            }
          });
        } else {
          fs.readFile(path, 'base64', (err, data) => {
            if (err && err.code !== 'ENOENT') {
              // TODO: catch file does not exist
              console.error('[vite storage] error while loading', path, err);
              reject(err);
            } else {
              console.log('[vite storage] load |', path);
              reply(data);
            }
          });
        }
      });

      addMessageHandler<{ path: string }>(server, 'storage:remove', (req, reply, reject) => {
        const path = buildPath(req.path);
        fs.rm(path, err => {
          if (err && err.code !== 'ENOENT') {
            // TODO: catch file does not exist
            console.error('[vite storage] error while loading', path, err);
            reject(err);
          } else {
            console.log('[vite storage] remove |', path);
            reply('ok');
          }
        });
      });
    }
  };
};
