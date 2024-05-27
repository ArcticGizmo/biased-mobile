import { Camera, CameraResultType, CameraSource, GalleryPhoto } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { alertController, isPlatform } from '@ionic/vue';
import { useToast } from '@/composables/toast';
import { sad } from 'ionicons/icons';

// TODO: deal with permissions

export type ImageFormat = 'png' | 'jpeg';

export interface B64Image {
  b64Data: string;
  format: ImageFormat;
}

export type KPhotoResponse = { ok: true; image: B64Image } | { ok: false; error: any };

const ensureFormat = (format: string) => {
  if (['png', 'jpeg'].includes(format)) {
    return format as ImageFormat;
  }

  throw 'invalid format';
};

const b64UriToImage = (b64Uri: string): B64Image => {
  const [preamble, b64Data] = b64Uri.split(',');

  const format = ensureFormat(preamble.replace('data:image/', '').split(';')[0]);

  return { b64Data, format };
};

const imageToB64Uri = (image: B64Image): string => {
  return `data:image/${image.format};base64,${image.b64Data}`;
};

// const encodeBase64Uri = (base64Data: string, format: string) => {
//   return `data:image/${format};base64,${base64Data}`;
// };

const convertBlobToBase64Uri = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
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

// const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
//   const byteCharacters = atob(b64Data);
//   const byteArrays = [];

//   for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
//     const slice = byteCharacters.slice(offset, offset + sliceSize);

//     const byteNumbers = new Array(slice.length);
//     for (let i = 0; i < slice.length; i++) {
//       byteNumbers[i] = slice.charCodeAt(i);
//     }

//     const byteArray = new Uint8Array(byteNumbers);
//     byteArrays.push(byteArray);
//   }

//   const blob = new Blob(byteArrays, { type: contentType });
//   return blob;
// };

// const splitBase64Uri = (base64Uri: string) => {
//   const [first, second] = base64Uri.split(',');

//   if (first.startsWith('data:')) {
//     return ''
//   }

// }

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

      const dataURI = canvas.toDataURL('image/jpeg');

      resolve(dataURI);
    };

    img.onerror = e => reject(e);

    img.src = base64Uri;
  });
};

// const getMimeFromBase64Uri = (base64Uri: string) => {
//   return base64Uri.split(';', 1)[0].replace('data:', '');
// };

const createOkPhoto = (b64Data: string, format: string): KPhotoResponse => {
  const a: KPhotoResponse = { ok: true, image: { b64Data, format: ensureFormat(format) } };
  console.log('created', a);
  return a;
};

// const createOkPhoto = (base64Uri: string): KPhotoResponse => {
//   console.log('create photo', base64Uri);
//   return { ok: true, image: { b64Data: '', format: '' } };
// };

const photoTob64Image = async (photo: GalleryPhoto): Promise<B64Image> => {
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path!
    });
    const data = file.data as string;

    return { b64Data: data, format: ensureFormat(photo.format) };
  }

  // Fetch the photo, read as a blob, then convert to base64 format
  const response = await fetch(photo.webPath!);
  const blob = await response.blob();
  const base64Uri = await convertBlobToBase64Uri(blob);
  return b64UriToImage(base64Uri);
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

      console.dir(photo);

      return createOkPhoto(photo.base64String!, photo.format);
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

      // const base64Uri = await photoToBase64Uri(photo);
      // console.log(base64Uri);
      // const image = b64UriToImageData(base64Uri);
      const image = await photoTob64Image(photo);

      console.log(image);

      return createOkPhoto(image.b64Data, image.format);
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
      const image = b64UriToImage(base64Uri);
      return createOkPhoto(image.b64Data, image.format);
    } catch (error: any) {
      console.error('unable to parse from url', error);
      return handleError(error, "That link didn't work. Check your connection or try another one!");
    }
  };

  return { takePhoto, photoFromGallery, photoFromUrl, resizeMaxDimension };
};
