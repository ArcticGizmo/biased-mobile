import { KPopCard } from '@/types';
import { groupBy } from '@/util/groupBy';
import { firstBy } from 'thenby';
import { Collage } from '@/util/collage';

interface CardGroup {
  title: string;
  cards: KPopCard[];
}

const createCollage = () => {
  return new Collage({ pageSize: { width: 2000, height: 2830 }, pagePadding: 40, cardHeight: 165, showOwnership: true });
};

export const createImages = async (cards: KPopCard[]) => {
  const title = cards[0].artist;

  // create groups from cards
  const groups = createCardGroups(cards);

  const collages: Collage[] = [];

  let c = createCollage();
  c.addPageTitle(title);
  collages.push(c);

  for (const group of groups) {
    await c.addSection(group.title, group.cards);

    if (!c.isFull) {
      continue;
    }

    c = createCollage();
    c.addPageTitle(title);
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
  sortedCards.sort(firstBy('year').thenBy('whereFromName'));

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
