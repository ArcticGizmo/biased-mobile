<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onActionSheet('md')">Action Sheet (md)</IonButton>
      <IonButton @click="onActionSheet('ios')">Action Sheet (ios)</IonButton>
      <IonButton @click="onLoadCustomSheet()">Custom Sheet</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton, actionSheetController } from '@ionic/vue';
import { dialogController } from '@/composables/dialogController';
import KCardActionSheet from '@/components/KCardActionSheet.vue';

const onLoadCustomSheet = async () => {
  const resp = await dialogController.create({
    component: KCardActionSheet
  });

  console.log(resp);
};

const onActionSheet = async (mode: 'ios' | 'md') => {
  const actionSheet = await actionSheetController.create({
    mode: mode,
    header: 'Actions',
    buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        data: {
          action: 'delete'
        }
      },
      {
        text: 'Share',
        data: {
          action: 'share'
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        data: {
          action: 'cancel'
        }
      }
    ]
  });

  await actionSheet.present();
};
</script>
