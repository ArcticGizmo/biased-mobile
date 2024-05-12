import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { FileSaveResult, FileLoadResult, FileSaveOptions, IFileStore } from './types';

export class FileStoreNative implements IFileStore {
  type: 'web' | 'native' = 'native';

  async save(path: string, data: string, opts?: FileSaveOptions): Promise<FileSaveResult> {
    try {
      const savedFile = await Filesystem.writeFile({
        recursive: true,
        path,
        data,
        directory: opts?.directory || Directory.Data,
        encoding: opts?.encoding || Encoding.UTF8
      });

      return { ok: true, path: savedFile.uri };
    } catch (error) {
      console.error('[file store | native] unable to save', error);
      return { ok: false, error };
    }
  }

  async load(path: string): Promise<FileLoadResult> {
    try {
      const resp = await Filesystem.readFile({ path, encoding: Encoding.UTF8 });
      // blob is only allowed on the web, so it will always be string
      return { ok: true, data: resp.data as string };
    } catch (error) {
      console.error('[file store | native] unable to load', error);
      return { ok: false, error };
    }
  }

  // TODO: add special image save versions
}
