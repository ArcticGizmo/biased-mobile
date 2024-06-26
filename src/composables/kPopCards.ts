import { KPopCard, OptionalFields } from '@/types';
import { ComputedRef, readonly, ref, watch } from 'vue';
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

loadSaved();

export const useKPopCards = () => {
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

  const deleteCards = async (ids: string[]) => {
    const promises = ids.map(id => {
      const matchingCard = cards.value.find(c => c.id === id);

      if (!matchingCard) {
        return;
      }

      return FileStore.remove(matchingCard.imageFilePath);
    });
    await Promise.all(promises);

    cards.value = cards.value.filter(c => !ids.includes(c.id));
  };

  const update = (id: string, changes: KPopCardUpdate) => {
    const card = cards.value.find(c => c.id === id)!;

    const updatedCard = { ...card, ...changes, id };
    Object.assign(card, updatedCard);

    cards.value = [...cards.value];
  };

  const importBackup = async (backup: Backup, packId?: string) => {
    const items = backupToPackedCards(backup);
    const newCards: KPopCard[] = [];

    const existingIds = new Set(cards.value.map(c => c.id));

    const summary = {
      imported: 0,
      skipped: 0
    };

    for (const item of items) {
      if (item.id && existingIds.has(item.id)) {
        summary.skipped++;
        continue;
      }
      const extension = getExtensionFromBase64Uri(item.imageSrc, 'image/png');
      const fileResult = await FileStore.saveImage(`photo-cards/${uuidv1()}.${extension}`, item.imageSrc);

      if (!fileResult.ok) {
        console.error('[import backup] unable to store file', item);
        throw 'unable to store file';
      }

      // TODO: this will need to check to see if the file already exists for ownership

      const card: KPopCard = {
        id: item.id || uuidv1(),
        packId,
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

      summary.imported++;
    }

    cards.value = [...cards.value, ...newCards];

    return summary;
  };

  return {
    cards: readonly(cards) as ComputedRef<KPopCard[]>,
    isLoading: readonly(isLoading),
    addCard,
    deleteCard,
    deleteCards,
    update,
    clearCards,
    importBackup,
    generateId: () => uuidv1()
  };
};
