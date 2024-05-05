<template>
  <div class="switch-input">
    <div class="label mr-2" v-if="label">{{ label }}</div>
    <IonSegment :model-value="segmentValue" mode="ios" @change="onChange">
      <IonSegmentButton value="true" :layout="layout">
        <slot name="true">{{ trueText || 'True' }}</slot>
      </IonSegmentButton>
      <IonSegmentButton value="false" :layout="layout">
        <slot name="false">{{ falseText || 'False' }}</slot>
      </IonSegmentButton>
    </IonSegment>
  </div>
</template>

<script setup lang="ts">
import { IonSegment, IonSegmentButton } from '@ionic/vue';
import { computed } from 'vue';

const model = defineModel<boolean>({ required: true });

defineProps<{
  label?: string;
  trueText?: string;
  falseText?: string;
  layout?: 'icon-top' | 'icon-start' | 'icon-end' | 'icon-bottom' | 'icon-hide' | 'label-hide';
}>();

const segmentValue = computed(() => (model.value ? 'true' : 'false'));

const onChange = (e: any) => {
  console.dir(e);
};
</script>

<style scoped>
.switch-input {
  display: flex;
}

.label {
  display: flex;
  align-items: center;
}
</style>
