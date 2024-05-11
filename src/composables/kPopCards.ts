import { KPopCard, OptionalFields } from '@/types';
import { onMounted, readonly, ref, watch } from 'vue';
import { useStorage } from './storage';
import { deleteFile } from './localFileSystem';
import { v1 as uuidv1 } from 'uuid';

type KPopCardUpdate = Omit<OptionalFields<KPopCard>, 'id'>;

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

  const update = (id: string, changes: KPopCardUpdate) => {
    const card = cards.value.find(c => c.id === id)!;

    const updatedCard = { ...card, ...changes, id };
    Object.assign(card, updatedCard);

    cards.value = [...cards.value];
  };

  // const importTemplate = async () => {};

  // const exportBackup

  // const importBackup

  return { cards: readonly(cards), addCard, update, clearCards, generateId: () => uuidv1() };
};
