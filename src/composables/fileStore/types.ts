import type { Directory, Encoding } from '@capacitor/filesystem';

export interface FileSaveOptions {
  /** Default: Directory.Data */
  directory?: Directory;
  /** Defualt: Encoding.UTF8. Is ignored on web */
  encoding?: Encoding;
}

export type FileSaveResult = { ok: true; path: string } | { ok: false; error: any };

export type FileLoadResult = { ok: true; data: string | undefined } | { ok: false; error: any };

export interface IFileStore {
  type: 'web' | 'native';

  save(path: string, data: string, opts?: FileSaveOptions): Promise<FileSaveResult>;
  load(path: string): Promise<FileLoadResult>;
}
