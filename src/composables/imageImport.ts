import { Camera, CameraResultType, CameraSource, GalleryPhoto } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { alertController, isPlatform } from '@ionic/vue';
import { useToast } from '@/composables/toast';
import { sad } from 'ionicons/icons';
import { Base64Uri } from './base64';

// TODO: deal with permissions

export type KPhotoResponse = { ok: true; base64Uri: Base64Uri } | { ok: false; error: any };

const photoToBase64Uri = async (photo: GalleryPhoto): Promise<Base64Uri> => {
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path!
    });
    const data = file.data as string;

    return Base64Uri.fromParts(data, photo.format);
  }

  // Fetch the photo, read as a blob, then convert to base64 format
  const response = await fetch(photo.webPath!);
  const blob = await response.blob();
  return await Base64Uri.fromBlob(blob);
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

  const takePhoto = async (): Promise<KPhotoResponse> => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 100
      });

      const base64Uri = Base64Uri.fromParts(photo.base64String!, photo.format);
      return { ok: true, base64Uri };
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

      return { ok: true, base64Uri };
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
      const base64Uri = await Base64Uri.fromBlob(blob);
      return { ok: true, base64Uri };
    } catch (error: any) {
      console.error('unable to parse from url', error);
      return handleError(error, "That link didn't work. Check your connection or try another one!");
    }
  };

  return { takePhoto, photoFromGallery, photoFromUrl };
};
