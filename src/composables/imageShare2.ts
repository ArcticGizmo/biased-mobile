import { KPopCard } from '@/types';
import { groupBy } from '@/util/groupBy';
import { firstBy } from 'thenby';
import { FileStore } from './fileStore';
import { Base64Uri } from './base64';

/*
Worse case is 16 albumns in one row

*/

interface Pos {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface CardGroup {
  title: string;
  cards: KPopCard[];
}

// interface Page2 {
//   title: string;
//   rows: PageSection[];
// }

// interface PageSection {
//   title: string;
//   cards: PageCard[];
// }

// interface PageCard {
//   dataUrl: string;
//   version?: string;
// }

const CONFIG = {
  fonts: {
    pageTitle: 32,
    groupTitle: 22,
    version: 10
  },
  padding: 10,
  space: 5,
  gap: 15,
  maxCardsPerRow: 16,
  pageSize: { width: 2480, height: 3500 },
  aspectRatio: 0.707
};

const CARD_WIDTH =
  (CONFIG.pageSize.width - 2 * CONFIG.padding - CONFIG.maxCardsPerRow * (CONFIG.gap + CONFIG.space)) / (CONFIG.maxCardsPerRow * 1.25);
const CARD_HEIGHT = CARD_WIDTH / CONFIG.aspectRatio;

export const createImage = async (cards: KPopCard[]) => {
  // create groups from cards
  const groups = createCardGroups(cards);

  console.log(groups);

  // create pages
  const pages = createPages(groups);

  // render pages
  const data = await renderPage(pages[0]);

  return data;
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

const createPages = (groups: CardGroup[]) => {
  // figure out how much room there is
  const rowHeight = CONFIG.fonts.groupTitle + CONFIG.gap + CARD_HEIGHT + CONFIG.fonts.version;
  const numberOfRows = Math.floor((CONFIG.pageSize.height - 2 * CONFIG.padding - CONFIG.fonts.pageTitle) / rowHeight);

  const pages: Page[] = [];

  let curPage = new Page(numberOfRows, CONFIG.maxCardsPerRow);

  for (const group of groups) {
    const needsNewPage = curPage.addGroup(group);

    if (needsNewPage) {
      pages.push(curPage);
      curPage = new Page(numberOfRows, CONFIG.maxCardsPerRow);
    }
  }

  if (curPage.segments.length && !pages.includes(curPage)) {
    pages.push(curPage);
  }

  return pages;
};

interface PageSegment {
  group: CardGroup;
  from: number;
  to: number;
}

class Page {
  private maxCols;
  private maxIndex;
  segments: PageSegment[] = [];

  constructor(maxRows: number, maxCols: number) {
    this.maxCols = maxCols;

    this.maxIndex = maxRows * maxCols;
  }

  addGroup(group: CardGroup) {
    const lastSegment = this.segments[this.segments.length - 1];
    const cardsInGroup = group.cards.length;
    if (!lastSegment) {
      this.segments.push({ group, from: 0, to: cardsInGroup - 1 });
      return false;
    }

    const spaceLeftInRow = this.calculateSpaceInSegment(lastSegment);

    let startFrom = lastSegment.to + 1;

    if (cardsInGroup > spaceLeftInRow) {
      startFrom += spaceLeftInRow - 1;
    }

    const newSegment: PageSegment = { group, from: startFrom, to: startFrom + cardsInGroup - 1 };

    if (newSegment.to >= this.maxIndex) {
      console.log('--- not enough room left. Need new page');
      return true;
    }

    this.segments.push(newSegment);
    return false;
  }

  private calculateSpaceInSegment(segment: PageSegment) {
    return CONFIG.maxCardsPerRow - (segment.to % this.maxCols);
  }
}

const renderPage = async (page: Page) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw 'Canvas not supported on device';
  }

  canvas.width = CONFIG.pageSize.width;
  canvas.height = CONFIG.pageSize.height;

  // we use a white background to help with printing
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // render the title text
  // TODO: center it and add background
  drawText(ctx, 'This is some text', CONFIG.fonts.pageTitle, { x: 0, y: 0 });

  const indexToGrid = (index: number) => {
    const row = Math.floor(index / CONFIG.maxCardsPerRow);
    const col = index % CONFIG.maxCardsPerRow;

    return { row, col };
  };

  const offset = { x: CONFIG.padding, y: CONFIG.padding + CONFIG.fonts.pageTitle };

  const cardTotalHeight = CARD_HEIGHT + CONFIG.fonts.version;

  for (const segment of page.segments) {
    // draw the title
    const startGrid = indexToGrid(segment.from);
    const textTopLeft = {
      x: offset.x + startGrid.col * (CARD_WIDTH + CONFIG.gap),
      y: offset.y + startGrid.row * (cardTotalHeight + CONFIG.gap)
    };

    drawText(ctx, segment.group.title, CONFIG.fonts.groupTitle, textTopLeft);

    // draw each card
    for (let i = segment.from; i <= segment.to; i++) {
      const grid = indexToGrid(i);

      const topLeft = {
        x: offset.x + grid.col * (CARD_WIDTH + CONFIG.gap),
        y: offset.y + CONFIG.fonts.groupTitle + grid.row * (cardTotalHeight + CONFIG.gap)
      };

      const card = segment.group.cards[i - segment.from];
      await drawImage(ctx, card.imageFilePath, topLeft);
      if (card.albumVersion) {
        drawText(ctx, card.albumVersion, CONFIG.fonts.version, { x: topLeft.x, y: topLeft.y + CARD_HEIGHT });
      }
    }

    // if the segment is on one row, bump for the next segment
    const startRow = indexToGrid(segment.from).row;
    const endRow = indexToGrid(segment.from).row;

    if (startRow === endRow) {
      offset.x += CONFIG.gap * 2;
    } else {
      offset.x = CONFIG.padding;
      offset.y = offset.y + (endRow - startRow) * cardTotalHeight;
    }

    // if segment has changed rows, move down and reset x

    // add an offset to the offset counter
    // console.log('----- ');
    // console.log(segment.from, indexToGrid(segment.from));
    // write the text
  }

  return canvas.toDataURL();
};

const drawText = (ctx: CanvasRenderingContext2D, text: string, fontSize: number, pos: Pos) => {
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = 'black';
  ctx.fillText(text, pos.x, pos.y + fontSize);
};

const drawImage = async (ctx: CanvasRenderingContext2D, filePath: string, pos: Pos) => {
  // TODO: add the scaling library here
  const imageResult = await FileStore.loadImage(filePath);

  if (!imageResult.ok) {
    throw 'failed to load image';
  }

  const img = await loadImage(filePath, CARD_WIDTH, CARD_HEIGHT);

  ctx.drawImage(img, pos.x, pos.y, CARD_WIDTH, CARD_HEIGHT);
};

const loadImage = async (filePath: string, maxWidth: number, maxHeight: number): Promise<HTMLImageElement> => {
  const file = await FileStore.loadImage(filePath);

  if (!file.ok) {
    throw 'unable to load image';
  }

  const scaledData = await Base64Uri.fromUri(file.data!).compress({ maxHeight, maxWidth });

  return await srcAsImage(scaledData.toString());
};

const srcAsImage = async (src: string): Promise<HTMLImageElement> => {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (error: any) => reject(error);
    img.src = src;
  });
};
