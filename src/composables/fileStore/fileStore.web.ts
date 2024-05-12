// TODO: consider the result pattern for this one as it can be complicated

import { ViteMessaging } from '@/vite/messaging';
import type { FileSaveResult, FileLoadResult } from './types';

interface SaveRequest {
  path: string;
  value: string;
}

interface LoadRequest {
  path: string;
}

export class FileStoreWeb {
  type = 'web';

  async save(path: string, data: any): Promise<FileSaveResult> {
    await ViteMessaging.request<SaveRequest, 'ok'>('storage:save', { path, value: data });

    return { ok: true, path: `web://${path}` };
  }

  async load(path: string): Promise<FileLoadResult> {
    const data = await ViteMessaging.request<LoadRequest, string | undefined>('storage:load', { path });
    return { ok: true, data };
  }

  // TODO: add special image save versions
}
