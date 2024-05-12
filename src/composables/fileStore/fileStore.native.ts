import { Directory, Filesystem } from '@capacitor/filesystem';
import type { FileSaveResult, FileLoadResult } from './types';

export class FileStoreNative {
  type = 'native';

  async save(path: string, data: any): Promise<FileSaveResult> {
    const savedFile = await Filesystem.writeFile({
      recursive: true,
      path,
      data,
      // TODO: make dynamic
      directory: Directory.Data
    });

    console.dir(savedFile);

    return { ok: true, path: `native:${savedFile.uri}` };
  }

  async load(path: string): Promise<FileLoadResult> {
    return { ok: true, data: '' };
  }

  // TODO: add special image save versions
}
