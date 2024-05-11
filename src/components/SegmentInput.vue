<template>
  <IonSegment
    v-model="model"
    :class="{ readonly }"
    mode="ios"
    @ionChange="(e: any) => onChange(e.target.value as T)"
    :aria-readonly="readonly"
    :disabled="disabled"
  >
    <IonSegmentButton v-for="(option, index) of options" :key="index" class="pt-1" :value="option.value" layout="icon-top">
      <IonLabel>{{ option.text }}</IonLabel>
      <IonIcon :icon="option.icon" :color="option.iconColor" />
    </IonSegmentButton>
  </IonSegment>
</template>

<script setup lang="ts" generic="T extends SegmentValue">
import { IonSegment, IonSegmentButton, IonLabel, IonIcon, type SegmentValue } from '@ionic/vue';

export interface SegmentControlProps {
  readonly?: boolean;
  disabled?: boolean;
}

interface SegementOption<T> {
  value: T;
  text: string;
  icon: string;
  iconColor?: string;
}

interface SegementProps extends SegmentControlProps {
  options: SegementOption<T>[];
}

const model = defineModel<T>({ required: true });

defineProps<SegementProps>();

const emits = defineEmits<{ (e: 'change', value: T): void }>();

const onChange = (value: T) => emits('change', value);
</script>

<style scoped>
.readonly {
  opacity: 1;
  pointer-events: none;
}

.readonly .segment-button-checked::part(indicator-background) {
  background-color: transparent;
}

/* there are styles that exist globally for easy of access */
</style>
