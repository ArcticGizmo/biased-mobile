import { IKvStore } from './types';
import { Preferences } from '@capacitor/preferences';

export class KvStoreNative implements IKvStore {
  type: 'web' | 'native' = 'native';

  async saveJson<T = object>(key: string, data: T) {
    return await this.save(key, JSON.stringify(data));
  }

  async save(key: string, value: string) {
    await Preferences.set({
      key,
      value
    });
  }

  async load(key: string) {
    const resp = await Preferences.get({ key });
    return resp.value ?? undefined;
  }

  async loadJson<T>(key: string) {
    const resp = await this.load(key);
    if (resp == null) {
      return undefined;
    }

    return JSON.parse(resp) as T;
  }
}
