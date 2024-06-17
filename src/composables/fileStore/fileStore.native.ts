import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type {
  FileSaveResult,
  FileLoadResult,
  FileSaveOptions,
  IFileStore,
  FileRemoveResult,
  FileLoadOptions,
  FileEncoding,
  ImageSaveOptions
} from './types';
import { Capacitor } from '@capacitor/core';
import { getMimeTypeFromPath } from '../mime';
import { Media } from '@capacitor-community/media';

const ALBUM_NAME = 'KPopCards';

const getEncoding = (encoding: FileEncoding) => {
  if (encoding === 'base64') {
    return undefined;
  }
  return encoding as Encoding;
};

const getAlbumnId = async () => {
  let album = await getAlbum();

  if (album) {
    return album.identifier;
  }

  await Media.createAlbum({ name: ALBUM_NAME });

  album = await getAlbum();

  if (album) {
    return album.identifier;
  }

  throw new Error(`${ALBUM_NAME} album does not exist`);
};

const getAlbum = async () => {
  const { albums } = await Media.getAlbums();
  let album = undefined;
  if (Capacitor.getPlatform() === 'android') {
    const albumsPath = (await Media.getAlbumsPath()).path;
    album = albums.find(a => a.name === ALBUM_NAME && a.identifier.startsWith(albumsPath));
  } else {
    album = albums.find(a => a.name === ALBUM_NAME);
  }

  return album;
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

  async saveImage(path: string, base64Data: string, opts?: ImageSaveOptions | undefined): Promise<FileSaveResult> {
    return await this.save(path, base64Data, { directory: opts?.directory, encoding: 'base64' });
  }

  async saveToGallery(fileName: string, base64Data: string): Promise<void> {
    await Media.savePhoto({ path: base64Data, albumIdentifier: await getAlbumnId(), fileName });
  }

  async load(path: string, opts?: FileLoadOptions): Promise<FileLoadResult> {
    const encoding = getEncoding(opts?.encoding || 'utf8');

    try {
      const resp = await Filesystem.readFile({ path, encoding });

      // blob is only allowed on the web, so it will always be string
      return { ok: true, data: resp.data as string };
    } catch (error) {
      console.error('[file store | native] unable to load', error);
      return { ok: false, error };
    }
  }

  async loadImage(path: string): Promise<FileLoadResult> {
    const resp = await this.load(path, { encoding: 'base64' });

    if (resp.ok) {
      const mime = getMimeTypeFromPath(path, 'image/png');
      resp.data = `data:${mime};base64,${resp.data}`;
    }

    return resp;
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
