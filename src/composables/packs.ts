import { ENV } from '@/env';
import { useQuery } from '@tanstack/vue-query';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { Backup } from './backup';
import { ComputedRef, readonly, ref } from 'vue';
import { KvStore } from './kvStore';

export interface AvailablePack {
  packId: string;
  artist: string;
  group: string;
  updatedAt: number;
  url: string;
}

export interface PackHistory {
  id: string;
  timestamp: number;
  cardIds: string[];
}

const LOOKUP_ID = ENV.driveId;
const HISTORY_KEY = 'pack-histories';

const makeWretch = (base: string) => {
  const url = ENV.isMobile ? base : '/proxy/' + base;
  return wretch().addon(QueryStringAddon).url(url);
};

const w = makeWretch('https://drive.google.com');

export const fetchPack = async (url: string) => {
  return await makeWretch(url).get().json<Backup>();
};

export const usePacksQuery = () => {
  return useQuery({
    queryKey: ['packs'],
    retry: 0,
    queryFn: async () => {
      const resp = await w
        .query({ id: LOOKUP_ID, export: 'download' })
        .get('/uc')
        .json<AvailablePack[]>((raw: AvailablePack[]) => {
          return raw.map(r => {
            const packId = `${r.artist}|${r.group}`.toLowerCase();
            return {
              packId,
              artist: r.artist,
              group: r.group,
              updatedAt: r.updatedAt,
              url: r.url
            };
          });
        });

      return resp.filter(p => !!p.url);
    }
  });
};

const packHistories = ref<PackHistory[]>([]);

const cacheHistory = async () => {
  KvStore.saveJson(HISTORY_KEY, packHistories.value);
};

const loadSaved = async () => {
  packHistories.value = (await KvStore.loadJson<PackHistory[]>(HISTORY_KEY)) || [];
};

loadSaved();

export const usePackHistory = () => {
  const addPack = async (packId: string, timestamp: number, cardIds: string[]) => {
    deletePack(packId);
    packHistories.value.push({ id: packId, timestamp, cardIds });
    await cacheHistory();
  };

  const deletePack = async (packId: string) => {
    packHistories.value = packHistories.value.filter(p => p.id !== packId);
    await cacheHistory();
  };

  const deleteAllPacks = async () => {
    packHistories.value = [];
    await cacheHistory();
  };

  return { packHistories: readonly(packHistories) as ComputedRef<PackHistory[]>, addPack, deletePack, deleteAllPacks };
};
