import type { Directory } from '@capacitor/filesystem';

export type FileEncoding = 'base64' | 'utf8';

export interface FileSaveOptions {
  /** Default: Directory.Data */
  directory?: Directory;
  /** Defualt: Encoding.UTF8. Is ignored on web */
  encoding?: FileEncoding;
}

export interface ImageSaveOptions {
  /** Default: Directory.Data */
  directory?: Directory;
  /** Defualt: Encoding.UTF8. Is ignored on web */
  encoding?: FileEncoding;
}

export interface FileLoadOptions {
  /** Defualt: Encoding.UTF8. Is ignored on web */
  encoding?: FileEncoding;
}

export type FileSaveResult = { ok: true; path: string } | { ok: false; error: any };

export type FileLoadResult = { ok: true; data: string | undefined } | { ok: false; error: any };

export type FileRemoveResult = { ok: true } | { ok: false; error: any };

export interface IFileStore {
  type: 'web' | 'native';

  save(path: string, data: string, opts?: FileSaveOptions): Promise<FileSaveResult>;
  saveImage(path: string, base64Data: string, opts?: ImageSaveOptions): Promise<FileSaveResult>;
  load(path: string, opts?: FileLoadOptions): Promise<FileLoadResult>;
  loadImage(path: string): Promise<FileLoadResult>;
  remove(path: string): Promise<FileRemoveResult>;
  toHref(pathOrBase64: string): string;
}
