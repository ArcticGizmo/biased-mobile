<template>
  <div class="ion-array-input">
    <IonLabel :class="{ 'error-text-color': errorMessage && meta.touched }">{{ label }}</IonLabel>
    <div class="flex" v-for="(field, index) in fields" :key="field.key">
      <IonFormInput :name="`${name}[${index}]`" mode="md" label-placement="stacked" fill="outline" inputmode="text" />
      <IonButton fill="clear" size="small" @click="remove(index)">
        <IonIcon slot="icon-only" :icon="close" />
      </IonButton>
    </div>
    <div class="error-text error-text-color pl-4">
      {{ errorMessage }}
    </div>
    <IonButton size="small" fill="outline" @click="push('')">Add Another</IonButton>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonLabel } from '@ionic/vue';
import { useField, useFieldArray } from 'vee-validate';
import { close } from 'ionicons/icons';
import IonFormInput from './IonFormInput.vue';
import { watch } from 'vue';

const props = defineProps<{ name: string; label?: string }>();

const { value, errorMessage, meta } = useField<string[]>(() => props.name);
const { fields, push, remove } = useFieldArray<string>(() => props.name);

// Ensure that we always have at least 1 element
watch(
  value,
  arr => {
    if (!arr.length) push('');
  },
  { immediate: true }
);
</script>

<style scoped>
.error-text {
  font-size: 0.9rem;
}

.error-text-color {
  color: var(--ion-color-danger);
}
</style>
