import { Camera, CameraResultType, CameraSource, GalleryPhoto } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { alertController, isPlatform } from '@ionic/vue';
import { useToast } from '@/composables/toast';
import { sad } from 'ionicons/icons';

// TODO: deal with permissions

export interface KPhoto {
  base64Uri: string;
  format: string;
}

export type KPhotoResponse = { ok: true; photo: KPhoto } | { ok: false; error: any };

const encodeBase64Uri = (base64Data: string, format: string) => {
  return `data:image/${format};base64,${base64Data}`;
};

const convertBlobToBase64Uri = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

const limitDimensions = (width: number, height: number, maxSize: number) => {
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (aspectRatio > 1) {
    return { width: maxSize, height: (height * maxSize) / width };
  } else {
    return { height: maxSize, width: (width * maxSize) / height };
  }
};

const resizeMaxDimension = async (base64Uri: string, maxSize: number) => {
  return new Promise<string>((resolve, reject) => {
    const img = document.createElement('img');

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const { width, height } = limitDimensions(img.width, img.height, maxSize);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const dataURI = canvas.toDataURL(getMimeFromBase64Uri(base64Uri));

      resolve(dataURI);
    };

    img.onerror = e => reject(e);

    img.src = base64Uri;
  });
};

const getMimeFromBase64Uri = (base64Uri: string) => {
  return base64Uri.split(';', 1)[0].replace('data:', '');
};

const createOkPhoto = (base64Uri: string): KPhotoResponse => {
  return { ok: true, photo: { base64Uri, format: getMimeFromBase64Uri(base64Uri) || 'image/jpeg' } };
};

export const useImageImport = () => {
  const { showToast } = useToast();

  const handleError = (error: any, message: string): KPhotoResponse => {
    const msg = error.message || '';
    if (msg !== 'User cancelled photos app') {
      console.error('unable to take photo', error);
      showToast({ message, color: 'danger', icon: sad });
    }
    return { ok: false, error };
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
    return (await convertBlobToBase64Uri(blob)) as string;
  };

  const takePhoto = async (): Promise<KPhotoResponse> => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 10
      });

      return createOkPhoto(encodeBase64Uri(photo.base64String!, photo.format));
    } catch (error) {
      return handleError(error, "We couldn't take a picture");
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

      return createOkPhoto(base64Uri);
    } catch (error) {
      return handleError(error, "We couldn't read from your gallery");
    }
  };

  const photoFromUrl = async (): Promise<KPhotoResponse> => {
    const alert = await alertController.create({
      subHeader: 'Enter your URL',
      buttons: [
        { text: 'Ok', role: 'ok' },
        { text: 'cancel', role: 'cancel' }
      ],
      inputs: [{ name: 'url', label: 'URL', type: 'url', placeholder: 'https://the-hottest-idol...' }]
    });
    alert.present();

    const alertResp = await alert.onDidDismiss<{ values: { url: string } }>();

    if (alertResp.role !== 'ok') {
      return { ok: false, error: 'cancelled' };
    }

    const url = alertResp.data?.values.url || '';

    if (!url) {
      return { ok: false, error: 'cancelled' };
    }

    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const base64Uri = (await convertBlobToBase64Uri(blob)) as string;
      return createOkPhoto(base64Uri);
    } catch (error: any) {
      console.error('unable to parse from url', error);
      return handleError(error, "That link didn't work. Check your connection or try another one!");
    }
  };

  return { takePhoto, photoFromGallery, photoFromUrl, resizeMaxDimension };
};
