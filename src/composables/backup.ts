import { KPopCard, KPopCardPackable } from '@/types';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { FileStore } from './fileStore';
import { Directory } from '@capacitor/filesystem';
import { getDateTimeFileName } from '@/util/datetime';

export interface BackupV1 {
  version: 1;
  cards: KPopCardPackable[];
}

export type Backup = BackupV1;

export type LoadBackupResponse = { ok: true; backup: Backup } | { ok: false; error: any };

export const createBackup = async (cards: KPopCard[]) => {
  const backup = await buildBackup(cards);
  const filename = `kpop-cards-backup-${getDateTimeFileName(new Date())}.txt`;
  return await FileStore.save(filename, JSON.stringify(backup), { directory: Directory.Documents });
};

const buildBackup = async (cards: KPopCard[]): Promise<BackupV1> => {
  const packedCards: KPopCardPackable[] = [];

  for (const card of cards) {
    const loadResult = await FileStore.loadImage(card.imageFilePath);
    if (!loadResult.ok) {
      console.error('could not load file', card.imageFilePath, loadResult.error);
      throw loadResult.error;
    }

    packedCards.push({
      id: card.id,
      packId: card.packId,
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

  return { version: 1, cards: packedCards };
};

export const loadBackup = async (): Promise<LoadBackupResponse> => {
  try {
    const result = await FilePicker.pickFiles({ types: ['text/plain'], readData: true });
    const file = result.files[0];

    if (!file) {
      return { ok: false, error: 'no file selected' };
    }

    const rawData = atob(file.data as string) || '[]';
    return { ok: true, backup: JSON.parse(rawData) };
  } catch (error) {
    console.error('[backup] unable to load backup', error);
    return { ok: false, error };
  }
};
