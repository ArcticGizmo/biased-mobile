import { ENV } from '@/env';
import { onMounted, readonly, ref } from 'vue';

export const useInitialLoad = (duration: number) => {
  const loading = ref(!ENV.IS_DEV);

  onMounted(() => {
    setTimeout(() => (loading.value = false), duration);
  });

  return { loading: readonly(loading) };
};
