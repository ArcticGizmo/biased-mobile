import { onIonViewDidEnter } from '@ionic/vue';
import { onMounted, ref } from 'vue';

export const useQueryParam = (name: string, fallback?: string) => {
  const value = ref(fallback);

  const loadValue = () => {
    value.value = new URLSearchParams(window.location.search).get(name) || fallback;
  };

  onMounted(() => {
    loadValue();
  });

  onIonViewDidEnter(() => {
    loadValue();
  });

  return value;
};
