// TODO: consider the result pattern for this one as it can be complicated

import { ViteMessaging } from '@/vite/messaging';
import type { FileSaveResult, FileLoadResult, FileRemoveResult, IFileStore, FileSaveOptions, FileEncoding, FileLoadOptions } from './types';
import { Directory } from '@capacitor/filesystem';
import { getMimeType } from './mime';

interface SaveRequest {
  path: string;
  value: string;
  encoding: FileEncoding;
}

interface LoadRequest {
  path: string;
  encoding: FileEncoding;
}

interface RemoveRequest {
  path: string;
}

const trimPrefix = (path: string) => path.replace('web://', '');

export class FileStoreWeb implements IFileStore {
  type: 'web' | 'native' = 'web';

  async save(path: string, data: any, opts?: FileSaveOptions): Promise<FileSaveResult> {
    const dir = opts?.directory || Directory.Data;
    path = `${dir}/${trimPrefix(path)}`;
    try {
      await ViteMessaging.request<SaveRequest, 'ok'>('storage:save', { path, value: data, encoding: opts?.encoding || 'utf8' });
      return { ok: true, path: `web://${path}` };
    } catch (error) {
      console.error('[file store | web] unable to save', error);
      return { ok: false, error };
    }
  }

  async load(path: string, opts?: FileLoadOptions): Promise<FileLoadResult> {
    path = trimPrefix(path);
    const encoding = opts?.encoding || 'utf8';
    try {
      let data = await ViteMessaging.request<LoadRequest, string | undefined>('storage:load', { path, encoding });

      if (encoding === 'base64') {
        const mime = getMimeType(path, 'image/png');
        data = `data:${mime};base64,${data}`;
      }

      return { ok: true, data };
    } catch (error) {
      console.error('[file store | web] unable to load', error);
      return { ok: false, error };
    }
  }

  async remove(path: string): Promise<FileRemoveResult> {
    path = trimPrefix(path);
    try {
      await ViteMessaging.request<RemoveRequest, 'ok'>('storage:remove', { path });
      return { ok: true };
    } catch (error) {
      console.error('[file store | web] unable to load', error);
      return { ok: false, error };
    }
  }

  toHref(path: string) {
    if (path.startsWith('web://')) {
      return path.replace('web://', 'http://localhost:8200/');
    }
    return path;
  }
}
