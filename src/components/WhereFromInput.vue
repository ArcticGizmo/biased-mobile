<template>
  <SegmentInput v-model="model" :options="OPTIONS" v-bind="props" />
</template>

<script setup lang="ts">
import { WhereFrom } from '@/types';
import SegmentInput, { type SegmentControlProps } from './SegmentInput.vue';
import { calendar, musicBox } from '@/icons';

const model = defineModel<WhereFrom>({ required: true });

const props = defineProps<SegmentControlProps>();

const OPTIONS = [
  {
    value: 'album',
    text: 'Album',
    icon: musicBox
  },
  {
    value: 'event',
    text: 'Event',
    icon: calendar
  }
];
</script>
