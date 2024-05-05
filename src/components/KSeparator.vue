<template>
  <div class="my-4 k-separator" :style="{ borderTopColor: color || 'black', borderTopWidth }"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ color?: string; thickness?: string | number }>();

const borderTopWidth = computed(() => {
  const t = props.thickness;
  if (!t) {
    return;
  }
  if (!isNaN(Number(t))) {
    return `${t}px`;
  }

  return t;
});
</script>

<style scoped>
.k-separator {
  border-top: 1px solid gray;
}
</style>
