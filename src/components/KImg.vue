<template>
  <div class="k-img" :class="{ background }" :style="{ aspectRatio, width, height }">
    <div v-if="state === 'fallback'" class="centered-container">
      <slot name="fallback">
        <IonIcon class="fallback-icon" :icon="imageOutline" />
      </slot>
    </div>

    <div v-if="state === 'loading'" class="centered-container">
      <slot name="loading">
        <IonSpinner name="dots" />
      </slot>
    </div>

    <IonImg
      :class="{ invisible: state !== 'ok', cover }"
      :src="src"
      @ionError="onError()"
      @ionImgWillLoad="onWillLoad()"
      @ionImgDidLoad="onDidLoad()"
    />
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonImg, IonSpinner } from '@ionic/vue';
import { imageOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';

const props = defineProps<{
  src?: string;
  aspectRatio?: number | string;
  width?: number | string;
  height?: number | string;
  cover?: boolean;
  background?: boolean;
}>();

const loading = ref(true);
const errored = ref(false);

const state = computed(() => {
  if (errored.value || !props.src) {
    return 'fallback';
  }

  if (loading.value) {
    return 'loading';
  }

  return 'ok';
});

const onError = () => {
  errored.value = true;
  loading.value = false;
};

const onDidLoad = () => {
  loading.value = false;
};

const onWillLoad = () => {
  loading.value = true;
  errored.value = false;
};
</script>

<style scoped>
.k-img.background {
  background-color: rgba(0, 0, 0, 0.1);
}

.k-img > * {
  width: 100%;
  height: 100%;
}

.centered-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.fallback-icon {
  width: 100%;
  height: 100%;
  max-width: 3rem;
  max-height: 3rem;
}

.invisible {
  width: 0;
  height: 0;
}

.cover {
  object-fit: cover;
}
</style>
