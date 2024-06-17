<template>
  <BaseActionDialog>
    <div class="pt-4 mx-2">
      <OwnershipInput :model-value="card?.ownershipType || 'none'" :disabled="!card" @change="onOwnershipChange" />
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
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { OwnershipType } from '@/types';

const props = defineProps<{ id: string }>();

const { cards, update } = useKPopCards();

const card = computed(() => cards.value.find(c => c.id === props.id));

const onView = () => {
  dialogController.dismiss({ role: 'view' });
};

const onDelete = () => {
  dialogController.dismiss({ role: 'delete' });
};

const onOwnershipChange = (ownershipType: OwnershipType) => {
  update(props.id, { ownershipType });
};
</script>
