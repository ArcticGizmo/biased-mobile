<template>
  <BaseActionDialog>
    <div class="pt-4 mx-2">
      <OwnershipInput
        :model-value="matchedCards[0]?.ownershipType || 'none'"
        :disabled="!matchedCards.length"
        @change="onOwnershipChange"
      />
    </div>
    <ion-list>
      <ion-item v-for="(button, index) of buttons" :key="index">
        <ion-label :color="button.color" @click="onButtonSelect(button)">{{ button.text }}</ion-label>
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

export interface ActionSheetButton {
  text: string;
  role?: string;
  data?: any;
  color?: string;
}

const props = defineProps<{ ids: string[]; buttons: ActionSheetButton[] }>();

const { cards, update } = useKPopCards();

const matchedCards = computed(() => cards.value.filter(c => props.ids.includes(c.id)));

const onButtonSelect = (button: ActionSheetButton) => {
  dialogController.dismiss({ role: button.role, data: button.data });
};

const onOwnershipChange = (ownershipType: OwnershipType) => {
  for (const card of matchedCards.value) {
    update(card.id, { ownershipType });
  }
};
</script>
