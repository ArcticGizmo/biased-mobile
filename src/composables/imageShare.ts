/*
TODO: is there a way to make it so I can get the data out of the image?
*/

import { KPopCard, OwnershipType } from '@/types';
import { FileStore } from './fileStore';
import { groupBy } from '@/util/groupBy';
import { Base64Uri } from './base64';
import { checkmarkCircle, heart, paperPlane } from 'ionicons/icons';

interface LayoutRow {
  album: string;
  year?: string;
  cards: KPopCard[];
}

interface Pos {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const TARGET_SIZE: Size = { width: 110, height: 165 };
const MAX_ITEMS_PER_ROW = 5;
const PADDING = 25;
const GAP = 5;

const getFillColor = (ownershipType: OwnershipType) => {
  switch (ownershipType) {
    case 'have':
      return 'green';
    case 'in-transit':
      return 'orange';
    case 'want':
      return 'red';
    default:
      return 'transparent';
  }
};

const withSvgFill = (dataUrl: string, color: string) => dataUrl.replace('<svg', `<svg fill='${color}'`);

const getSvg = (ownershipType: OwnershipType) => {
  switch (ownershipType) {
    case 'have':
      return withSvgFill(checkmarkCircle, getFillColor(ownershipType));
    case 'in-transit':
      return withSvgFill(paperPlane, getFillColor(ownershipType));
    case 'want':
      return withSvgFill(heart, getFillColor(ownershipType));
    default:
      return;
  }
};

class ImageBuilder {
  private canvas = document.createElement('canvas');
  private ctx;
  private pos: Pos = { x: PADDING, y: PADDING };

  constructor() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw 'Canvas context could not be attained';
    }

    this.canvas.width = (TARGET_SIZE.width + GAP) * MAX_ITEMS_PER_ROW + 2 * PADDING + 5;
    this.canvas.height = 10_000;

    this.ctx = ctx;
    ctx.fillStyle = '#fff8ec';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async addRow(row: LayoutRow) {
    // add a title
    const pos: Pos = { ...this.pos };
    const title = row.year ? `${row.album} (${row.year})` : row.album;
    this.drawText(title, 24, pos);
    pos.y += 24 + GAP;

    // add an image
    let colIndex = 0;

    for (const card of row.cards) {
      if (colIndex > MAX_ITEMS_PER_ROW - 1) {
        colIndex = 0;
        pos.y += TARGET_SIZE.height + GAP;
      }

      const imagePos = { x: pos.x + colIndex * (TARGET_SIZE.width + GAP), y: pos.y };
      await this.drawImage(card.imageFilePath, imagePos);

      // draw ownership outline + icon
      this.ctx.strokeStyle = getFillColor(card.ownershipType);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(imagePos.x, imagePos.y, TARGET_SIZE.width, TARGET_SIZE.height);

      const svgIcon = getSvg(card.ownershipType);
      if (svgIcon) {
        await this.drawSvg(svgIcon, imagePos, { width: 25, height: 25 });
      }

      colIndex++;
    }

    this.pos = { x: PADDING, y: pos.y + TARGET_SIZE.height + PADDING };
  }

  private async drawSvg(dataUrl: string, pos: Pos, size: Size) {
    const img = await buildImage(dataUrl);
    this.ctx.drawImage(img, pos.x, pos.y, size.width, size.height);
  }

  private drawText(text: string, fontSize: number, pos: Pos) {
    // TODO: add border for the text (use measure text to calculate it)
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(text, pos.x, pos.y + fontSize, this.canvas.width - 2 * PADDING);
  }

  private async drawImage(filePath: string, pos: Pos) {
    // TODO: add the scaling library here
    const imageResult = await FileStore.loadImage(filePath);

    if (!imageResult.ok) {
      throw 'failed to load image';
    }

    const img = await loadImage(filePath, TARGET_SIZE.width, TARGET_SIZE.height);

    this.ctx.drawImage(img, pos.x, pos.y, TARGET_SIZE.width, TARGET_SIZE.height);
  }

  toDataUrl() {
    const newCanvas = document.createElement('canvas');

    newCanvas.width = this.canvas.width;
    newCanvas.height = this.pos.y + PADDING;

    const newCtx = newCanvas.getContext('2d')!;
    newCtx.drawImage(this.canvas, 0, 0);

    const data = newCanvas.toDataURL();

    this.canvas = undefined!;

    return data;
  }
}

export const createImage = async (cards: KPopCard[]) => {
  const layout = buildLayout(cards);

  const builder = new ImageBuilder();

  // TODO: add a title zone for who they are?

  // for (const row of layout) {
  //   await builder.addRow(row);
  // }

  await builder.addRow(layout[0]);
  await builder.addRow(layout[1]);
  await builder.addRow(layout[2]);

  // downloadFile('kpop-template', builder.toDataUrl());

  // console.dir(layout);
  return builder.toDataUrl();
};

const buildLayout = (cards: KPopCard[]): LayoutRow[] => {
  // sort
  const sortedCards = [...cards];
  sortedCards.sort((a, b) => parseInt(a.year || '0') - parseInt(b.year || '0'));

  // get albums
  const albums = [...new Set(sortedCards.map(c => c.whereFromName))];
  const groups = groupBy(sortedCards, card => card.whereFromName);

  return albums.map(album => {
    const year = groups[album][0].year;
    return {
      album,
      year,
      cards: groups[album]
    };
  });
};

const buildImage = async (src: string): Promise<HTMLImageElement> => {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (error: any) => reject(error);

    img.src = src;
  });
};

const loadImage = async (filePath: string, maxWidth: number, maxHeight: number): Promise<HTMLImageElement> => {
  const file = await FileStore.loadImage(filePath);

  if (!file.ok) {
    throw 'unable to load image';
  }

  const scaledData = await Base64Uri.fromUri(file.data!).compress({ maxHeight, maxWidth });

  return await buildImage(scaledData.toString());
};

const downloadFile = (filename: string, dataUrl: string) => {
  const link = document.createElement('a');
  link.download = `filename.jpg`;
  link.href = dataUrl;
  link.click();
};
