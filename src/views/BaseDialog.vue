<template>
  <div class="dialog-base" :style="{ justifyContent }" @click="onBackgroundDismiss">
    <IonBackdrop visible />
    <div class="content w-full" :style="{ maxWidth, zIndex: 3 }" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonBackdrop } from '@ionic/vue';
import { dialogController } from '@/composables/dialogController';

interface DialogProps {
  persistent?: boolean;
  maxWidth?: string;
  justifyContent?: 'center' | 'flex-start' | 'flex-end';
}

const props = withDefaults(defineProps<DialogProps>(), {
  maxWidth: '500px'
});

const emits = defineEmits<{
  (e: 'backdrop'): void;
}>();

const onBackgroundDismiss = () => {
  emits('backdrop');
  if (!props.persistent) {
    dialogController.backdropDismiss();
  }
};
</script>

<style>
.ios .dialog-base .sheet {
  border-radius: 1rem;
  padding: 0.5rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
}
</style>

<style scoped>
.dialog-base {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes backgroundFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.5;
  }
}

@keyframes backgroundFadeOut {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 0;
  }
}

ion-backdrop {
  background: var(--ion-color-dark);
  opacity: 0;
  pointer-events: none;
}

.open ion-backdrop {
  animation: backgroundFadeIn ease 0.3s 1 forwards;
}

.closing ion-backdrop {
  animation: backgroundFadeOut ease 0.3s 1 forwards;
}
</style>
