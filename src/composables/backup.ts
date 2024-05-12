import { KPopCard, KPopCardPackable } from '@/types';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { FileStore } from './fileStore';
import { Directory } from '@capacitor/filesystem';

export type LoadBackupResponse = { ok: true; cards: KPopCardPackable[] } | { ok: false; error: any };

export const createBackup = async (cards: KPopCard[]) => {
  const backup = await buildBackup(cards);
  const filename = `kpop-cards-backup-${getBackupName()}.txt`;
  return await FileStore.save(filename, JSON.stringify(backup), { directory: Directory.Documents });
};

const buildBackup = async (cards: KPopCard[]) => {
  const packedCards: KPopCardPackable[] = [];

  for (const card of cards) {
    const loadResult = await FileStore.loadImage(card.imageFilePath);
    if (!loadResult.ok) {
      console.error('could not load file', card.imageFilePath, loadResult.error);
      throw loadResult.error;
    }

    packedCards.push({
      id: card.id,
      imageSrc: loadResult.data || '',
      artist: card.artist,
      artistType: card.artistType,
      groupName: card.groupName,
      whereFrom: card.whereFrom,
      whereFromName: card.whereFromName,
      albumVersion: card.albumVersion,
      year: card.year,
      ownershipType: card.ownershipType
    });
  }

  return packedCards;
};

const padNumber = (num: number) => `${num}`.padStart(2, '0');

const getBackupName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = padNumber(now.getMonth() + 1);
  const date = padNumber(now.getDate());
  const hour = padNumber(now.getHours());
  const minutes = padNumber(now.getMinutes());
  const seconds = padNumber(now.getSeconds());
  return `${year}${month}${date}-${hour}${minutes}${seconds}`;
};

export const loadBackup = async (): Promise<LoadBackupResponse> => {
  try {
    const result = await FilePicker.pickFiles({ types: ['text/plain'], readData: true });
    const file = result.files[0];

    if (!file) {
      return { ok: false, error: 'no file selected' };
    }

    const rawData = atob(file.data as string) || '[]';
    return { ok: true, cards: JSON.parse(rawData) };
  } catch (error) {
    console.error('[backup] unable to load backup', error);
    return { ok: false, error };
  }
};
