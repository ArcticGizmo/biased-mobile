// TODO: consider the result pattern for this one as it can be complicated

import { ViteMessaging } from '@/vite/messaging';
import type { FileSaveResult, FileLoadResult, FileRemoveResult, IFileStore, FileSaveOptions } from './types';
import { Directory } from '@capacitor/filesystem';

interface SaveRequest {
  path: string;
  value: string;
}

interface LoadRequest {
  path: string;
}

export class FileStoreWeb implements IFileStore {
  type: 'web' | 'native' = 'web';

  async save(path: string, data: any, opts?: FileSaveOptions): Promise<FileSaveResult> {
    const dir = opts?.directory || Directory.Data;
    const fullPath = `${dir}/${path}`;
    try {
      await ViteMessaging.request<SaveRequest, 'ok'>('storage:save', { path: fullPath, value: data });
      return { ok: true, path: fullPath };
    } catch (error) {
      console.error('[file store | web] unable to save', error);
      return { ok: false, error };
    }
  }

  async load(path: string): Promise<FileLoadResult> {
    try {
      const data = await ViteMessaging.request<LoadRequest, string | undefined>('storage:load', { path });
      return { ok: true, data };
    } catch (error) {
      console.error('[file store | web] unable to load', error);
      return { ok: false, error };
    }
  }

  async remove(path: string): Promise<FileRemoveResult> {
    try {
      await ViteMessaging.request<LoadRequest, 'ok'>('storage:remove', { path });
      return { ok: true };
    } catch (error) {
      console.error('[file store | web] unable to load', error);
      return { ok: false, error };
    }
  }

  // TODO: add special image save versions
}
