<template>
  <BaseActionDialog>
    <div class="pt-4 mx-2">
      <OwnershipInput model-value="none" />
    </div>
    <ion-list>
      <ion-item>
        <ion-label @click="onView()">View</ion-label>
      </ion-item>
      <ion-item>
        <ion-label color="danger" @click="onDelete()">Delete</ion-label>
      </ion-item>
    </ion-list>
  </BaseActionDialog>
</template>

<script setup lang="ts">
import BaseActionDialog from '@/views/BaseActionDialog.vue';
import { dialogController } from '@/composables/dialogController';
import { IonList, IonItem, IonLabel } from '@ionic/vue';
import OwnershipInput from './OwnershipInput.vue';

const onView = () => {
  dialogController.dismiss({ role: 'view' });
};

const onDelete = () => {
  dialogController.dismiss({ role: 'delete' });
};
</script>
