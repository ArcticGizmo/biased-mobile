<template>
  <SegmentInput v-model="model" :options="OPTIONS" v-bind="props" />
</template>

<script setup lang="ts">
import { WhereFrom } from '@/types';
import { musicalNotes, calendar } from 'ionicons/icons';
import SegmentInput, { type SegmentControlProps } from './SegmentInput.vue';

const model = defineModel<WhereFrom>({ required: true });

const props = defineProps<SegmentControlProps>();

const OPTIONS = [
  {
    value: 'album',
    text: 'Album',
    icon: musicalNotes
  },
  {
    value: 'event',
    text: 'Event',
    icon: calendar
  }
];
</script>
