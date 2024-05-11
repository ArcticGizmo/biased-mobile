<template>
  <SegmentInput v-model="model" :options="OPTIONS" v-bind="props" />
</template>

<script setup lang="ts">
import { ArtistType } from '@/types';
import { people, person } from 'ionicons/icons';
import SegmentInput, { type SegmentControlProps } from './SegmentInput.vue';

const model = defineModel<ArtistType>({ required: true });

const props = defineProps<SegmentControlProps>();

const OPTIONS = [
  {
    value: 'group',
    text: 'Group',
    icon: people
  },
  {
    value: 'solo',
    text: 'Solo',
    icon: person
  }
];
</script>
