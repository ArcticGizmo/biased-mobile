import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { FileSaveResult, FileLoadResult, FileSaveOptions, IFileStore, FileRemoveResult, FileLoadOptions, FileEncoding } from './types';
import { Capacitor } from '@capacitor/core';
import { getMimeType } from './mime';

const getEncoding = (encoding: FileEncoding) => {
  if (encoding === 'base64') {
    return undefined;
  }
  return encoding as Encoding;
};

export class FileStoreNative implements IFileStore {
  type: 'web' | 'native' = 'native';

  async save(path: string, data: string, opts?: FileSaveOptions): Promise<FileSaveResult> {
    const encoding = getEncoding(opts?.encoding || 'utf8');

    try {
      const savedFile = await Filesystem.writeFile({
        recursive: true,
        path,
        data,
        directory: opts?.directory || Directory.Data,
        encoding
      });

      return { ok: true, path: savedFile.uri };
    } catch (error) {
      console.error('[file store | native] unable to save', error);
      return { ok: false, error };
    }
  }

  async load(path: string, opts?: FileLoadOptions): Promise<FileLoadResult> {
    const encoding = getEncoding(opts?.encoding || 'utf8');

    try {
      const resp = await Filesystem.readFile({ path, encoding });

      // base64
      if (!encoding) {
        const mime = getMimeType(path, 'image/png');
        return { ok: true, data: `data:${mime};base64,${resp.data}` };
      }

      // blob is only allowed on the web, so it will always be string
      return { ok: true, data: resp.data as string };
    } catch (error) {
      console.error('[file store | native] unable to load', error);
      return { ok: false, error };
    }
  }

  async remove(path: string): Promise<FileRemoveResult> {
    try {
      await Filesystem.deleteFile({ path });
      return { ok: true };
    } catch (error) {
      console.error('[file store | native] unable to remove', error);
      return { ok: false, error };
    }
  }

  toHref(path: string): string {
    return Capacitor.convertFileSrc(path);
  }
}
