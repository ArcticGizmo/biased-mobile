import { KPopCard } from '@/types';
import { onMounted, readonly, ref, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/vue';

const STORAGE_KEY = 'kpop-cards';

const cards = ref<KPopCard[]>([]);
const isLoading = ref(true);

const cacheCards = () => {
  Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify(cards.value)
  });
};

watch(cards, cacheCards);

const loadSaved = async () => {
  isLoading.value = true;

  const storageResp = await Preferences.get({ key: STORAGE_KEY });
  const cardsOnDisk: KPopCard[] = storageResp.value ? JSON.parse(storageResp.value) : [];

  // // If running on the web...
  // if (!isPlatform('hybrid')) {
  //   for (const photo of photosInPreferences) {
  //     const file = await Filesystem.readFile({
  //       path: photo.filepath,
  //       directory: Directory.Data
  //     });
  //     // Web platform only: Load the photo as base64 data
  //     photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
  //   }
  // }

  cards.value = cardsOnDisk;
  isLoading.value = false;
};

export const useKPopCards = () => {
  onMounted(loadSaved);

  const add = (card: KPopCard) => {
    cards.value.push(card);
  };

  // const importTemplate = async () => {};

  // const exportBackup

  // const importBackup

  return { cards: readonly(cards), add };
};
