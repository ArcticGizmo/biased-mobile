import { KPopCard } from '@/types';
import wretch from 'wretch';

const THRESHOLD = 0.97;

const w = wretch().url('http://localhost:5005');

export interface ComparisonImage {
  id: string;
  extension: string;
}

export interface Similarity {
  id: string;
  score: number;
}

export const useImageCompare = () => {
  const compare = async (dataUrl: string, targets: ComparisonImage[]) => {
    return w.url('/compare').post({ image: dataUrl, targets }).json<Similarity[]>();
  };

  const findPossibleMatches = async (dataUrl: string, cards: KPopCard[]): Promise<KPopCard[]> => {
    if (!cards.length) {
      return [];
    }

    const targets = cards.map(c => {
      const parts = c.imageFilePath.split('.');
      return {
        id: c.id,
        extension: parts[parts.length - 1]
      };
    });

    const resp = await compare(dataUrl, targets);

    console.log('ranking', resp);

    return resp.filter(r => r.score > THRESHOLD).map(r => cards.find(c => c.id === r.id)!);
  };

  return { compare, findPossibleMatches };
};
