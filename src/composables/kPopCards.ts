import { KPopCard, OptionalFields } from '@/types';
import { onMounted, readonly, ref, watch } from 'vue';
import { KvStore } from './kvStore';
import { FileStore } from './fileStore';
import { v1 as uuidv1 } from 'uuid';
import { getExtensionFromBase64Uri } from './mime';
import { Backup } from './backup';

const STORAGE_KEY = 'kpop-cards';

type KPopCardUpdate = Omit<OptionalFields<KPopCard>, 'id'>;

const cards = ref<KPopCard[]>([]);
const isLoading = ref(false);

const cacheCards = () => {
  KvStore.saveJson(STORAGE_KEY, cards.value);
};

watch(cards, cacheCards);

const loadSaved = async () => {
  isLoading.value = true;
  cards.value = (await KvStore.loadJson<KPopCard[]>(STORAGE_KEY)) || [];
  isLoading.value = false;
};

const backupToPackedCards = (backup: Backup) => {
  if (backup.version === 1) {
    return backup.cards;
  }

  throw 'unknown backup version';
};

export const useKPopCards = () => {
  onMounted(() => {
    if (!isLoading.value) {
      loadSaved();
    }
  });

  const addCard = (card: KPopCard) => {
    cards.value = [...cards.value, card];
  };

  const clearCards = async () => {
    for (const card of cards.value) {
      await FileStore.remove(card.imageFilePath);
    }
    cards.value = [];
  };

  const deleteCard = async (id: string) => {
    const matchingCard = cards.value.find(c => c.id === id);

    if (!matchingCard) {
      return;
    }

    await FileStore.remove(matchingCard.imageFilePath);
    cards.value = cards.value.filter(c => c.id !== id);
  };

  const update = (id: string, changes: KPopCardUpdate) => {
    const card = cards.value.find(c => c.id === id)!;

    const updatedCard = { ...card, ...changes, id };
    Object.assign(card, updatedCard);

    cards.value = [...cards.value];
  };

  const importBackup = async (backup: Backup) => {
    const items = backupToPackedCards(backup);
    const newCards: KPopCard[] = [];

    for (const item of items) {
      const extension = getExtensionFromBase64Uri(item.imageSrc, 'image/png');
      const fileResult = await FileStore.saveImage(`photo-cards/${uuidv1()}.${extension}`, item.imageSrc);

      if (!fileResult.ok) {
        console.error('[import backup] unable to store file', item);
        throw 'unable to store file';
      }

      // TODO: this will need to check to see if the file already exists

      const card: KPopCard = {
        id: uuidv1(),
        imageFilePath: fileResult.path,
        artist: item.artist,
        artistType: item.artistType,
        groupName: item.groupName,
        whereFrom: item.whereFrom,
        whereFromName: item.whereFromName,
        albumVersion: item.albumVersion,
        year: item.year,
        ownershipType: item.ownershipType
      };

      newCards.push(card);
    }

    cards.value = [...cards.value, ...newCards];
  };

  // const importTemplate = async () => {};

  // const exportBackup

  // const importBackup

  return {
    cards: readonly(cards),
    isLoading: readonly(isLoading),
    addCard,
    deleteCard,
    update,
    clearCards,
    importBackup,
    generateId: () => uuidv1()
  };
};
