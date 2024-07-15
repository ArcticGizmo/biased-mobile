<template>
  <div class="tag-input">
    <div
      v-for="(option, index) of OPTIONS"
      :key="index"
      class="item"
      :class="{ selected: modelValue.includes(option.value) }"
      @click="onToggle(option.value)"
    >
      <IonIcon v-if="option.icon" :icon="option.icon" :color="option.iconColor" />
      <IonLabel>{{ option.text }}</IonLabel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tag } from '@/types';
import { IonLabel, IonIcon } from '@ionic/vue';
import { checkmarkCircle, heart, paperPlane } from 'ionicons/icons';
import { noCard } from '@/icons';

interface Option {
  value: Tag;
  text: string;
  icon: string;
  iconColor?: string;
}

const props = defineProps<{ modelValue: Tag[] }>();

const emits = defineEmits<{
  (e: 'update:model-value', value: Tag[]): void;
  (e: 'select', value: Tag): void;
  (e: 'deselect', value: Tag): void;
}>();

const onToggle = (value: Tag) => {
  console.log('---- eggg');
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

const OPTIONS: Option[] = [
  {
    value: 'pre-order-benefit',
    text: 'Missing',
    icon: noCard,
    iconColor: 'medium'
  },
  {
    value: 'weverse',
    text: 'Want',
    icon: heart,
    iconColor: 'love'
  },
  {
    value: 'broadcast',
    text: 'Coming',
    icon: paperPlane,
    iconColor: 'pending'
  },
  {
    value: 'event',
    text: 'Have',
    icon: checkmarkCircle,
    iconColor: 'owned'
  },
  {
    value: 'seasons-greetings',
    text: 'Missing',
    icon: noCard,
    iconColor: 'medium'
  },
  {
    value: 'membership',
    text: 'Want',
    icon: heart,
    iconColor: 'love'
  },
  {
    value: 'other',
    text: 'Coming',
    icon: paperPlane,
    iconColor: 'pending'
  },
  {
    value: 'pop-up',
    text: 'Have',
    icon: checkmarkCircle,
    iconColor: 'owned'
  }
];
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
  height: 4rem;
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
  font-size: 1.5rem;
}
</style>
