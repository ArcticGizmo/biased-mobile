import { KPopCard } from '@/types';
import { onMounted, readonly, ref, watch } from 'vue';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/vue';
import { useStorage } from './storage';
import { deleteFile } from './localFileSystem';

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

  const addCard = (card: KPopCard) => {
    cards.value = [...cards.value, card];
  };

  const clearCards = () => {
    // fire and forget
    for (const card of cards.value) {
      deleteFile(card.imageFile);
    }
    cards.value = [];
  };

  // const importTemplate = async () => {};

  // const exportBackup

  // const importBackup

  return { cards: readonly(cards), addCard, clearCards };
};
