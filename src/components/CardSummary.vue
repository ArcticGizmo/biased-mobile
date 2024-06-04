<template>
  <div class="flex justify-center gap-6">
    <div class="count text-center" v-for="(item, index) of items" :key="index">
      <IonIcon :icon="item.icon" :color="item.color" />
      <div>{{ item.count }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { heart } from 'ionicons/icons';
import { starBox, noCard } from '@/icons';
import { computed } from 'vue';

const props = defineProps<{ have?: number; want?: number; missing?: number }>();

const items = computed(() => {
  const have = props.have || 0;
  const want = props.want || 0;
  const missing = props.missing || 0;
  return [
    {
      icon: starBox,
      count: have,
      color: 'warning'
    },
    {
      icon: heart,
      count: want,
      color: 'danger'
    },
    {
      icon: noCard,
      count: missing,
      color: 'medium'
    }
  ];
});
</script>

<style scoped>
ion-icon {
  font-size: 2.5rem;
}
</style>
