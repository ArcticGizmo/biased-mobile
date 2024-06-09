<template>
  <SegmentInput v-model="model" :options="OPTIONS" v-bind="props" />
</template>

<script setup lang="ts">
import { OwnershipType } from '@/types';
import { checkmarkCircle, heart, paperPlane } from 'ionicons/icons';
import SegmentInput, { type SegmentControlProps } from './SegmentInput.vue';
import { noCard } from '@/icons';

const model = defineModel<OwnershipType>({ required: true });

const props = defineProps<SegmentControlProps>();

const OPTIONS = [
  {
    value: 'none',
    text: 'Missing',
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
    value: 'in-transit',
    text: 'Coming',
    icon: paperPlane,
    iconColor: 'warning'
  },
  {
    value: 'have',
    text: 'Have',
    icon: checkmarkCircle,
    iconColor: 'secondary'
  }
];
</script>
