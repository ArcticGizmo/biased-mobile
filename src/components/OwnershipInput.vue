<template>
  <SegmentInput v-model="model" :options="OPTIONS" v-bind="props" />
</template>

<script setup lang="ts">
import { OwnershipType } from '@/types';
import { heart } from 'ionicons/icons';
import SegmentInput, { type SegmentControlProps } from './SegmentInput.vue';
import { noCard, starBox } from '@/icons';

const model = defineModel<OwnershipType>({ required: true });

const props = defineProps<SegmentControlProps>();

const OPTIONS = [
  {
    value: 'none',
    text: "Don't Have",
    icon: noCard,
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
    icon: starBox,
    iconColor: 'warning'
  }
];
</script>
