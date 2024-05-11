<template>
  <IonCard class="m-1">
    <KImg :class="{ 'grayscale opacity-60': greyOut }" aspect-ratio="0.7" :src="src" />
    <IonCardContent class="flex flex-col justify-center p-1 h-14">
      <IonCardTitle class="text-sm text-ellipsis overflow-hidden whitespace-nowrap">{{ title }}</IonCardTitle>
      <IonCardSubtitle v-if="subtitle" class="text-xs text-ellipsis overflow-hidden whitespace-nowrap">{{ subtitle }}</IonCardSubtitle>
    </IonCardContent>
    <IonIcon v-if="status === 'want'" class="absolute top-2 right-2" color="danger" size="large" :icon="heartCircle" />
    <IonIcon v-if="status === 'have'" class="absolute top-2 right-2" color="warning" size="large" :icon="ribbon" />
  </IonCard>
</template>

<script setup lang="ts">
import { IonCard, IonIcon, IonCardContent, IonCardTitle, IonCardSubtitle } from '@ionic/vue';
import { heartCircle, ribbon, happy } from 'ionicons/icons';
import KImg from './KImg.vue';
import { OwnershipType } from '@/types';
import { computed } from 'vue';

interface KCardProps {
  src?: string;
  title?: string;
  subtitle?: string;
  status?: OwnershipType;
}

const props = withDefaults(defineProps<KCardProps>(), { status: 'none' });

const greyOut = computed(() => props.status !== 'have');
</script>
