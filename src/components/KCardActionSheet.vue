<template>
  <BaseActionDialog @swipe-close="onClose()">
    <div class="pt-4 pb-2 mx-2">
      <OwnershipInput
        :model-value="matchedCards[0]?.ownershipType || 'none'"
        :disabled="!matchedCards.length"
        @change="onOwnershipChange"
      />
    </div>
    <div v-if="selectedTags.length" class="tags">
      <ion-chip v-for="(tag, index) in selectedTags" :key="index">
        <IonIcon :icon="tag.icon" />
        <span>{{ tag.text }}</span>
      </ion-chip>
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
import { IonList, IonItem, IonLabel, IonChip, IonIcon } from '@ionic/vue';
import OwnershipInput from './OwnershipInput.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { OwnershipType } from '@/types';
import { getFilteredTags } from '@/types/tags';

export interface ActionSheetButton {
  text: string;
  role?: string;
  data?: any;
  color?: string;
}

const props = defineProps<{ ids: string[]; buttons: ActionSheetButton[] }>();

const { cards, updateCard } = useKPopCards();

const matchedCards = computed(() => cards.value.filter(c => props.ids.includes(c.id)));

const onButtonSelect = (button: ActionSheetButton) => {
  dialogController.dismiss({ role: button.role, data: button.data });
};

const onOwnershipChange = (ownershipType: OwnershipType) => {
  for (const card of matchedCards.value) {
    updateCard(card.id, { ownershipType });
  }
  dialogController.dismiss({ role: 'cancel' });
};

const onClose = () => {
  dialogController.backdropDismiss();
};

const selectedTags = computed(() => {
  if (matchedCards.value.length === 1) {
    return getFilteredTags(matchedCards.value[0].tags || []);
  }
  return [];
});
</script>
