<template>
  <IonCard class="m-1">
    <template v-if="skeleton">
      <IonSkeletonText class="mx-auto" animated :style="{ width: '95%', aspectRatio: ASPECT_RATIO }" />
      <IonCardContent class="flex flex-col justify-center p-1 h-14">
        <IonSkeletonText animated :style="{ width: '40%' }" />
        <IonSkeletonText animated :style="{ width: '75%' }" />
      </IonCardContent>
    </template>
    <template v-else>
      <KImg :class="{ 'grayscale opacity-60': greyOut }" :aspect-ratio="ASPECT_RATIO" :src="src" />
      <IonCardContent class="flex flex-col justify-center p-1 h-14">
        <IonCardTitle class="text-sm text-ellipsis overflow-hidden whitespace-nowrap">{{ title }}</IonCardTitle>
        <IonCardSubtitle v-if="subtitle" class="text-xs text-ellipsis overflow-hidden whitespace-nowrap">{{ subtitle }}</IonCardSubtitle>
      </IonCardContent>
      <IonIcon v-if="status === 'want'" class="icon-want text-xl absolute top-2 right-2" color="danger" :icon="heartCircle" />
      <IonIcon v-if="status === 'have'" class="icon-have text-xl absolute top-2 right-2" color="warning" :icon="starBox" />
    </template>
  </IonCard>
</template>

<script setup lang="ts">
import { IonCard, IonIcon, IonCardContent, IonCardTitle, IonCardSubtitle, IonSkeletonText } from '@ionic/vue';
import { heartCircle } from 'ionicons/icons';
import KImg from './KImg.vue';
import { OwnershipType } from '@/types';
import { computed } from 'vue';
import { starBox } from '@/icons';

const ASPECT_RATIO = 0.7;

interface KCardProps {
  src?: string;
  title?: string;
  subtitle?: string;
  status?: OwnershipType;
  skeleton?: boolean;
}

const props = withDefaults(defineProps<KCardProps>(), { status: 'none' });

const greyOut = computed(() => props.status !== 'have');
</script>
