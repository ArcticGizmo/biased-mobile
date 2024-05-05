<template>
  <BasePage title="Home" pad>
    <!-- List of idols -->
    <div class="p-4">egg</div>
    <IonButton @click="onTakePicture()">Take Picture</IonButton>
    <IonButton @click="onSaveFile()">Save File</IonButton>
    <IonButton @click="onReadFile()">Read File</IonButton>
    <IonGrid>
      <IonRow>
        <IonCol size="6" :key="photo.filepath" v-for="photo in photos">
          <IonImg :src="photo.webviewPath" @click="onDeletePhoto(photo)" />
        </IonCol>
      </IonRow>
    </IonGrid>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton, IonCol, IonGrid, IonImg, IonRow, actionSheetController } from '@ionic/vue';
import BasePage from './BasePage.vue';
import { trash, close } from 'ionicons/icons';

import { usePhotoGallery, type UserPhoto } from '@/composables/photoGallery';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const { photos, takePhoto, deletePhoto } = usePhotoGallery();

const onTakePicture = async () => {
  takePhoto();
};

const onSaveFile = async () => {
  try {
    const a = await Filesystem.writeFile({
      path: 'example/text.txt',
      data: 'this is some data',
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true
    });
    console.dir(a);
  } catch (error) {
    console.error('write', error);
  }
};

const onReadFile = async () => {
  try {
    const data = await Filesystem.readFile({
      path: 'example/text.txt',
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    console.dir(data);
  } catch (error) {
    console.error('read', error);
  }
};

const onDeletePhoto = async (photo: UserPhoto) => {
  const actionSheet = await actionSheetController.create({
    header: 'Photos',
    buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        icon: trash,
        handler: () => {
          deletePhoto(photo);
        }
      },
      {
        text: 'Cancel',
        icon: close,
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      }
    ]
  });
  await actionSheet.present();
};
</script>
