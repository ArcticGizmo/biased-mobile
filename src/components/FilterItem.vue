<template>
  <IonButton class="filter-item" fill="outline" color="dark" size="small" :class="{ selected: modelValue }" @click="onToggle()">
    <IonIcon v-if="icon" slot="start" :icon="icon" />
    {{ text }}
  </IonButton>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';

const props = defineProps<{ modelValue?: boolean; text: string; icon?: string; selected?: boolean }>();

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'changed', value: boolean): void;
}>();

const onToggle = () => {
  const newValue = !props.modelValue;
  emits('update:modelValue', newValue);
  emits('changed', newValue);
};
</script>

<style scoped>
.filter-item::part(native) {
  border-width: 1px;
  border-color: rgba(var(--ion-color-dark-rgb), 0.2);
}

.filter-item.selected::part(native) {
  background-color: rgba(var(--ion-color-primary-rgb), 0.3);
  border-color: rgba(var(--ion-color-primary-rgb), 0.5);
  opacity: 1;
}
</style>
