import { KPopCard } from '@/types';
import { groupBy } from '@/util/groupBy';
import { firstBy } from 'thenby';
import { Collage } from '@/util/collage';

interface CardGroup {
  title: string;
  cards: KPopCard[];
}

export const createImage = async (cards: KPopCard[]) => {
  // create groups from cards
  const groups = createCardGroups(cards);

  const c = new Collage({ pageSize: { width: 500, height: 6000 }, pagePadding: 10, cardHeight: 100 });

  c.addPageTitle(cards[0].artist);
  for (const group of groups.slice(0, 9)) {
    await c.addSection(group.title, group.cards);
  }

  return c.toDataUrl();
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
