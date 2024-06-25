import { ENV } from '@/env';
import { useQuery } from '@tanstack/vue-query';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import FormUrlAddon from 'wretch/addons/formUrl';
import { Backup } from './backup';

export interface AvailablePack {
  packId: string;
  artist: string;
  group: string;
  updatedAt: number;
  url: string;
}

const LOOKUP_ID = '1Sq4GZwhedzhtJRcv-UCsV2l2-XJTlXYY';

const makeWretch = (base: string) => {
  const url = ENV.isMobile ? base : '/proxy/' + base;
  return wretch().addon(QueryStringAddon).addon(FormUrlAddon).url(url);
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
      // const resp = await w
      //   .query({ id: LOOKUP_ID, export: 'download' })
      //   .get('/uc')
      //   .json<AvailablePack[]>((raw: AvailablePack[]) => {
      //     return raw.map(r => {
      //       const packId = `${r.artist}|${r.group}`.toLowerCase();
      //       return {
      //         packId,
      //         artist: r.artist,
      //         group: r.group,
      //         updatedAt: r.updatedAt,
      //         url: r.url
      //       };
      //     });
      //   });
      // console.dir(resp);

      // return resp.filter(p => !!p.url);
      await new Promise(r => setTimeout(r, 500));
      return [
        {
          packId: 'dk|bss',
          artist: 'DK',
          group: 'BSS',
          updatedAt: 1719328530000,
          url: 'https://drive.google.com/uc?id=1HAMwzrr5coUxCKD_JpiREqqRIR3N6Umg&export=download'
        },
        {
          packId: 'woonhak|boynextdoor',
          artist: 'Woonhak',
          group: 'BoyNextDoor',
          updatedAt: 1719323425495,
          url: 'https://drive.google.com/uc?id=1KUUoh57wGC2RARVqccieyQVgFCjxO5PA&export=download'
        },
        {
          packId: 'taesan|boynextdoor',
          artist: 'Taesan',
          group: 'BoyNextDoor',
          updatedAt: 1719323409629,
          url: 'https://drive.google.com/uc?id=1FFia_YYMbrY844w7CVIyZqNk4o6gY-5C&export=download'
        },
        {
          packId: 'sungho|boynextdoor',
          artist: 'Sungho',
          group: 'BoyNextDoor',
          updatedAt: 1719323403254,
          url: 'https://drive.google.com/uc?id=17uHKUGYEhyXnp-zrTqKPGbzhCudzsvaC&export=download'
        },
        {
          packId: 'riwoo|boynextdoor',
          artist: 'Riwoo',
          group: 'BoyNextDoor',
          updatedAt: 1719323397536,
          url: 'https://drive.google.com/uc?id=1bcMomvApPTw9dnnHooZ5J3w2sGo8nCWz&export=download'
        },
        {
          packId: 'leehan|boynextdoor',
          artist: 'Leehan',
          group: 'BoyNextDoor',
          updatedAt: 1719323391093,
          url: 'https://drive.google.com/uc?id=1IdpWu5TZy8mAg-XNcTESrxcINyJBUsBI&export=download'
        },
        {
          packId: 'jaehyun|boynextdoor',
          artist: 'Jaehyun',
          group: 'BoyNextDoor',
          updatedAt: 1719323382676,
          url: 'https://drive.google.com/uc?id=1keQ56hWtGfOy3_DSr7ivlap1UfrOVoMI&export=download'
        },
        {
          packId: 'dk|seventeen',
          artist: 'DK',
          group: 'Seventeen',
          updatedAt: 1719328606417,
          url: 'https://drive.google.com/uc?id=1kO8FM7yeqt2YMSIz9kB-t411MvEokwsi&export=download'
        },
        {
          packId: 'woozi|seventeen',
          artist: 'Woozi',
          group: 'Seventeen',
          updatedAt: 1719325345459,
          url: 'https://drive.google.com/uc?id=1YsDP35QT0EL-8u-w3P4ff8qKWps9bXS3&export=download'
        },
        {
          packId: 'wonwoo|seventeen',
          artist: 'Wonwoo',
          group: 'Seventeen',
          updatedAt: 1719325341836,
          url: 'https://drive.google.com/uc?id=1lpndYB5OvW1041NY-w7vSKpHj9qLLp-v&export=download'
        },
        {
          packId: 'vernon|seventeen',
          artist: 'Vernon',
          group: 'Seventeen',
          updatedAt: 1719325336255,
          url: 'https://drive.google.com/uc?id=1XMqilBZQMQxGnIlU3Dc1QhQ-aWaKLzNu&export=download'
        },
        {
          packId: 'minghao (the 8)|seventeen',
          artist: 'Minghao (The 8)',
          group: 'Seventeen',
          updatedAt: 1719325325058,
          url: 'https://drive.google.com/uc?id=1rxvAfXfyf4No4zxPyqWV7SYPG2bwzCmw&export=download'
        },
        {
          packId: 'seungkwan|seventeen',
          artist: 'Seungkwan',
          group: 'Seventeen',
          updatedAt: 1719325273969,
          url: 'https://drive.google.com/uc?id=1Y5Wg4kCSLjoQ7EVqTUyKHfyc-PoGcYr6&export=download'
        },
        {
          packId: 'scoups|seventeen',
          artist: 'SCoups',
          group: 'Seventeen',
          updatedAt: 1719325267144,
          url: 'https://drive.google.com/uc?id=1ajqzIdjkbcx35nHLYwXEaLLa51G5utG5&export=download'
        },
        {
          packId: 'mingyu|seventeen',
          artist: 'Mingyu',
          group: 'Seventeen',
          updatedAt: 1719325261942,
          url: 'https://drive.google.com/uc?id=1hEcHUnp4c1EEGmcu_3ts9q_yWxnIK98I&export=download'
        },
        {
          packId: 'jun|seventeen',
          artist: 'Jun',
          group: 'Seventeen',
          updatedAt: 1719325252088,
          url: 'https://drive.google.com/uc?id=1vSWsc-ij1ooGYfVUdJphCgMPNl52XpCy&export=download'
        },
        {
          packId: 'joshua|seventeen',
          artist: 'Joshua',
          group: 'Seventeen',
          updatedAt: 1719325248779,
          url: 'https://drive.google.com/uc?id=10ujyRrKP--w_b-mvxZVJWcLypjJsD3Ot&export=download'
        },
        {
          packId: 'jeonghan|seventeen',
          artist: 'Jeonghan',
          group: 'Seventeen',
          updatedAt: 1719325244790,
          url: 'https://drive.google.com/uc?id=1Y8sWCVRFHPE_dHerY3LxKlCnn92nZUNk&export=download'
        },
        {
          packId: 'hoshi|seventeen',
          artist: 'Hoshi',
          group: 'Seventeen',
          updatedAt: 1719325237573,
          url: 'https://drive.google.com/uc?id=1MBICJTpIDd5gZoY8E_Xul8EGU5Li69Ar&export=download'
        },
        {
          packId: 'dino|seventeen',
          artist: 'Dino',
          group: 'Seventeen',
          updatedAt: 1719325227961,
          url: 'https://drive.google.com/uc?id=1QkMjRK-9q-9FKB4Yt978X_BsUNqw9rEZ&export=download'
        }
      ];
    }
  });
};
