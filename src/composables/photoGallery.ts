import { ref, onMounted, watch } from 'vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { isPlatform } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';

const PHOTO_STORAGE = 'photos';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

const photos = ref<UserPhoto[]>([]);

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

const photoToBase64Data = async (photo: Photo) => {
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path!
    });
    return file.data;
  }

  // Fetch the photo, read as a blob, then convert to base64 format
  const response = await fetch(photo.webPath!);
  const blob = await response.blob();
  return (await convertBlobToBase64(blob)) as string;
};

const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
  const base64Data = await photoToBase64Data(photo);

  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data
  });

  console.log('saved file', savedFile);

  if (isPlatform('hybrid')) {
    // Display the new image by rewriting the 'file://' path to HTTP
    // Details: https://ionicframework.com/docs/building/webview#file-protocol
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri)
    };
  } else {
    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }
};

const takePhoto = async () => {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 100
  });

  console.log('photo', photo);
  // could be webPath or path depending on platform

  const fileName = Date.now() + '.jpeg';
  const savedFileImage = await savePicture(photo, fileName);

  photos.value = [savedFileImage, ...photos.value];
};

const cachePhotos = () => {
  Preferences.set({
    key: PHOTO_STORAGE,
    value: JSON.stringify(photos.value)
  });
};

watch(photos, cachePhotos);

const loadSaved = async () => {
  const photoList = await Preferences.get({ key: PHOTO_STORAGE });
  const photosInPreferences: UserPhoto[] = photoList.value ? JSON.parse(photoList.value) : [];

  // If running on the web...
  if (!isPlatform('hybrid')) {
    for (const photo of photosInPreferences) {
      const file = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
      });
      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
    }
  }

  photos.value = photosInPreferences;
};

const deletePhoto = async (photo: UserPhoto) => {
  // Remove this photo from the Photos reference data array
  photos.value = photos.value.filter(p => p.filepath !== photo.filepath);

  // delete photo file from filesystem
  const filename = photo.filepath.slice(photo.filepath.lastIndexOf('/') + 1);
  await Filesystem.deleteFile({
    path: filename,
    directory: Directory.Data
  });
};

export const usePhotoGallery = () => {
  onMounted(loadSaved);

  return {
    photos,
    takePhoto,
    deletePhoto
  };
};
