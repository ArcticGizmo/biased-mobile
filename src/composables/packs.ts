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

export type PackHistory = Record<string, number>;

const LOOKUP_ID = '1Sq4GZwhedzhtJRcv-UCsV2l2-XJTlXYY';
const HISTORY_KEY = 'history';

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

const packHistory = ref<PackHistory>({});

const cacheHistory = async () => {
  KvStore.saveJson(HISTORY_KEY, packHistory.value);
};

const loadSaved = async () => {
  packHistory.value = (await KvStore.loadJson<PackHistory>(HISTORY_KEY)) || {};
};

loadSaved();

export const usePackHistory = () => {
  const addPack = async (packId: string, timestamp: number) => {
    packHistory.value[packId] = timestamp;
    await cacheHistory();
  };

  const deletePack = async (packId: string) => {
    delete packHistory.value[packId];
    await cacheHistory();
  };

  const deleteAllPacks = async () => {
    packHistory.value = {};
    await cacheHistory();
  };

  return { packHistory: readonly(packHistory) as ComputedRef<PackHistory>, addPack, deletePack, deleteAllPacks };
};
