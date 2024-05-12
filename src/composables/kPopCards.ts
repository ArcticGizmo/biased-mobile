import { KPopCard, OptionalFields } from '@/types';
import { onMounted, readonly, ref, watch } from 'vue';
import { KvStore } from './kvStore';
import { FileStore } from './fileStore';
import { v1 as uuidv1 } from 'uuid';

const STORAGE_KEY = 'kpop-cards';

type KPopCardUpdate = Omit<OptionalFields<KPopCard>, 'id'>;

const cards = ref<KPopCard[]>([]);
const isLoading = ref(true);

const cacheCards = () => {
  KvStore.saveJson(STORAGE_KEY, cards.value);
};

watch(cards, cacheCards);

const loadSaved = async () => {
  isLoading.value = true;
  cards.value = (await KvStore.loadJson<KPopCard[]>(STORAGE_KEY)) || [];
  isLoading.value = false;
};

export const useKPopCards = () => {
  onMounted(loadSaved);

  const addCard = (card: KPopCard) => {
    cards.value = [...cards.value, card];
  };

  const clearCards = () => {
    for (const card of cards.value) {
      // TODO: revisit
      // fire and forget so it just happens in the background
      FileStore.remove(card.imageFilePath);
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
