import { KPopCard } from '@/types';
import { onMounted, readonly, ref, watch } from 'vue';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/vue';
import { useStorage } from './storage';

const { saveValue, loadValue } = useStorage<KPopCard[]>('kpop-cards');

const cards = ref<KPopCard[]>([]);
const isLoading = ref(true);

const cacheCards = () => {
  saveValue(cards.value);
};

watch(cards, cacheCards);

const loadSaved = async () => {
  isLoading.value = true;
  cards.value = (await loadValue()) || [];
  isLoading.value = false;
};

export const useKPopCards = () => {
  onMounted(loadSaved);

  const add = (card: KPopCard) => {
    cards.value = [...cards.value, card];
  };

  const clear = () => {
    // Will need to delete the file from here as well
    cards.value = [];
  };

  // const importTemplate = async () => {};

  // const exportBackup

  // const importBackup

  return { cards: readonly(cards), add, clear };
};
