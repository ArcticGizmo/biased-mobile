import { KPopCard } from '@/types';
import { groupBy } from '@/util/groupBy';
import { firstBy } from 'thenby';
import { Collage } from '@/util/collage';

interface CardGroup {
  title: string;
  cards: KPopCard[];
}

export interface CreateImageOptions {
  title?: string;
  style?: 'plain' | 'border';
}

const getCardHeight = (count: number) => {
  if (count < 10) return 500;
  if (count < 20) return 400;
  if (count < 30) return 300;
  if (count < 60) return 200;
  return 165;
};

export const createImages = async (cards: KPopCard[], opts?: CreateImageOptions) => {
  const showOwnership = opts?.style === 'border';
  const cardHeight = getCardHeight(cards.length);
  const title = opts?.title;

  // create groups from cards
  const groups = createCardGroups(cards);

  const collages: Collage[] = [];

  const createCollage = () => {
    return new Collage({ pageSize: { width: 2000, height: 2830 }, pagePadding: 40, cardHeight, showOwnership });
  };

  let c = createCollage();
  if (title) {
    c.addPageTitle(title);
  }
  collages.push(c);

  for (const group of groups) {
    await c.addSection(group.title, group.cards);

    if (!c.isFull) {
      continue;
    }

    c = createCollage();
    if (title) {
      c.addPageTitle(title);
    }
    collages.push(c);

    await c.addSection(group.title, group.cards);

    // if this happens it means that section was never going to fit
    if (c.isFull) {
      console.error('[image share] group was never going to fit', group);
      c.reset();
    }
  }

  return collages.map(c => c.toDataUrl());
};

const createCardGroups = (cards: KPopCard[]): CardGroup[] => {
  // sort by year
  const sortedCards = [...cards];
  sortedCards.sort(
    firstBy('year')
      .thenBy('whereFromName')
      .thenBy('albumVersion')
      .thenBy(x => x.artists[0])
  );

  // get albums
  const albums = [...new Set(sortedCards.map(c => c.whereFromName))];
  const groups = groupBy(sortedCards, card => card.whereFromName);

  return albums.map(album => {
    const year = groups[album][0].year;
    const title = year ? `${album} (${year})` : album;
    return {
      title,
      cards: groups[album]
    };
  });
};
