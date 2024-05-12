export interface IKvStore {
  type: 'web' | 'native';
  saveJson(key: string, data: object): Promise<void>;
  save(key: string, value: string): Promise<void>;
  load(key: string): Promise<string | undefined>;
  loadJson<T>(key: string): Promise<T | undefined>;
}
