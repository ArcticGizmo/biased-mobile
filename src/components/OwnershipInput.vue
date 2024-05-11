<template>
  <SegmentInput v-model="model" :options="OPTIONS" v-bind="props" />
</template>

<script setup lang="ts">
import { OwnershipType } from '@/types';
import { heart, closeCircle, ribbon } from 'ionicons/icons';
import SegmentInput, { type SegmentControlProps } from './SegmentInput.vue';

const model = defineModel<OwnershipType>({ required: true });

const props = defineProps<SegmentControlProps>();

const OPTIONS = [
  {
    value: 'none',
    text: "Don't Have",
    icon: closeCircle,
    iconColor: 'dark'
  },
  {
    value: 'want',
    text: 'Want',
    icon: heart,
    iconColor: 'danger'
  },
  {
    value: 'have',
    text: 'Have',
    icon: ribbon,
    iconColor: 'warning'
  }
];
</script>
