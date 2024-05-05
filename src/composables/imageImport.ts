import { ref, onMounted, watch } from 'vue';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { isPlatform } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';

// TODO: deal with permissions
// TODO: allow image scaling to reduce file size

export interface KPhoto {
  base64Uri: string;
}

export type KPhotoResponse = { ok: true; photo: KPhoto } | { ok: false; error: any };

const encodeBase64Uri = (base64Data: string, format: string) => {
  return `data:image/${format};base64,${base64Data}`;
};

const convertBlobToBase64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

const photoToBase64Uri = async (photo: GalleryPhoto) => {
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path!
    });
    const data = file.data as string;
    if (data.startsWith('data:')) {
      return data;
    }

    return encodeBase64Uri(data, photo.format);
  }

  // Fetch the photo, read as a blob, then convert to base64 format
  const response = await fetch(photo.webPath!);
  const blob = await response.blob();
  return (await convertBlobToBase64(blob)) as string;
};

const takePhoto = async (): Promise<KPhotoResponse> => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 10
    });

    return { ok: true, photo: { base64Uri: encodeBase64Uri(photo.base64String!, photo.format) } };
  } catch (error) {
    // TODO: show a toast based on the error (if required)
    return { ok: false, error };
  }
};

const photoFromGallery = async (): Promise<KPhotoResponse> => {
  try {
    const resp = await Camera.pickImages({
      quality: 100,
      limit: 1
    });

    const photo = resp.photos[0];

    if (!photo) {
      throw 'no photos selected';
    }

    const base64Uri = await photoToBase64Uri(photo);

    return { ok: true, photo: { base64Uri } };
  } catch (error) {
    return { ok: false, error };
  }
};

const photoFromUrl = async () => {};

export const useImageImport = () => {
  return { takePhoto, photoFromGallery, photoFromUrl };
};
