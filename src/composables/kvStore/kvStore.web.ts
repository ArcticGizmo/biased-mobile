import { ViteMessaging } from '@/vite/messaging';
import { IKvStore } from './types';

interface SaveRequest {
  path: string;
  value: string;
}

interface LoadRequest {
  path: string;
}

const getPath = (key: string) => `kv-store/${key}.txt`;

export class KvStoreWeb implements IKvStore {
  type: 'web' | 'native' = 'web';

  async saveJson(key: string, data: object) {
    return await this.save(key, JSON.stringify(data));
  }

  async save(key: string, value: string) {
    await ViteMessaging.request<SaveRequest, 'ok'>('storage:save', { path: getPath(key), value });
  }

  async load(key: string) {
    return await ViteMessaging.request<LoadRequest, string | undefined>('storage:load', { path: getPath(key) });
  }

  async loadJson<T>(key: string) {
    const resp = await this.load(key);
    if (resp == null) {
      return undefined;
    }

    return JSON.parse(resp) as T;
  }
}
