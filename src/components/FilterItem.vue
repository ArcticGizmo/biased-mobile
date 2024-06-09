<template>
  <IonButton class="filter-item" fill="outline" color="dark" size="small" :class="{ selected: model }" @click="onToggle()">
    <IonIcon v-if="icon" slot="start" :icon="icon" />
    {{ text }}
  </IonButton>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';

const model = defineModel<boolean>();

defineProps<{ text: string; icon?: string; selected?: boolean }>();

const onToggle = () => {
  model.value = !model.value;
};
</script>

<style scoped>
.filter-item::part(native) {
  border-width: 1px;
  border-color: rgba(var(--ion-color-dark-rgb), 0.2);
}

.filter-item.selected::part(native) {
  background-color: rgba(var(--ion-color-dark-rgb), 0.1);
  border-color: rgba(var(--ion-color-dark-rgb), 0.5);
  opacity: 1;
}
</style>
