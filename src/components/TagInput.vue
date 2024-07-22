<template>
  <div class="tag-input">
    <div
      v-for="(tag, index) of TAGS"
      :key="index"
      class="item"
      :class="{ selected: modelValue.includes(tag.id) }"
      @click="onToggle(tag.id)"
    >
      <IonIcon v-if="tag.icon" :icon="tag.icon" :color="modelValue.includes(tag.id) ? 'primary' : 'medium'" />
      <IonLabel class="text-center">{{ tag.text }}</IonLabel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonLabel, IonIcon } from '@ionic/vue';
import { TAGS, type TagId } from '@/types/tags';

const props = defineProps<{ modelValue: TagId[] }>();

const emits = defineEmits<{
  (e: 'update:model-value', value: TagId[]): void;
  (e: 'select', value: TagId): void;
  (e: 'deselect', value: TagId): void;
}>();

const onToggle = (value: TagId) => {
  if (props.modelValue.includes(value)) {
    emits('deselect', value);
    emits(
      'update:model-value',
      props.modelValue.filter(v => v !== value)
    );
  } else {
    emits('select', value);
    emits('update:model-value', [...props.modelValue, value]);
  }
};
</script>

<style scoped>
.tag-input {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-color: rgba(0, 0, 0, 0.067);
  padding: 0.1rem;
  border-radius: 0.5rem;
}

.item {
  height: 4.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0.1rem;
  cursor: pointer;
}

.item:hover {
  opacity: 0.8;
}

.item.selected {
  background-color: rgba(var(--ion-color-primary-rgb), 0.075);
  border-radius: 0.5rem;
  box-shadow: 5px 5px 10px 0px rgba(255, 255, 255, 1), 3px 3px 5px 0px rgba(0, 0, 0, 0.1) inset;
}

ion-icon {
  font-size: 1.75rem;
}
</style>
