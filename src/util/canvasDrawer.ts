import type { Pos, Size } from '@/util/position';
import { FileStore } from '../composables/fileStore';
import { Base64Uri } from '../composables/base64';

export interface DrawTextOptions {
  text: string;
  pos: Pos;
  fontSize: number;
  size: Size;
  color?: string;
  backgroundColor?: string;
}

export interface DrawImageOptions {
  filePath: string;
  pos: Pos;
  size: Size;
}

type Area = Pos & Size;

const createArea = (pos: Pos, size: Size): Area => {
  return { x: pos.x, y: pos.y, width: size.width, height: size.height };
};

const getCenter = (area: Area) => {
  return { x: area.x + area.width / 2, y: area.y + area.height / 2 };
};

const createImageElement = async (filePath: string, maxWidth: number, maxHeight: number): Promise<HTMLImageElement> => {
  const file = await FileStore.loadImage(filePath);

  if (!file.ok) {
    throw 'unable to load image';
  }

  const scaledData = await Base64Uri.fromUri(file.data!).compress({ maxHeight, maxWidth });

  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (error: any) => reject(error);
    img.src = scaledData.toString();
  });
};

export class CanvasDrawer {
  private _pageSize: Size;
  private _pagePadding = 0;
  private _fontFamily = 'Arial';

  // pos is always relative to working boundary
  private _canvas = document.createElement('canvas');
  private _ctx: CanvasRenderingContext2D;

  constructor(pageSize: Size) {
    this._pageSize = pageSize;
    this._canvas.width = pageSize.width;
    this._canvas.height = pageSize.height;

    const ctx = this._canvas.getContext('2d');

    if (!ctx) {
      throw 'Canvas not supported in this context';
    }

    this._ctx = ctx;
  }

  get width() {
    return this._pageSize.width;
  }

  get height() {
    return this._pageSize.height;
  }

  drawText(opts: DrawTextOptions) {
    const container = createArea(opts.pos, opts.size);

    // draw the background
    if (opts.backgroundColor) {
      this.useContext(c => {
        c.fillStyle = opts.backgroundColor || 'transparent';
        c.fillRect(container.x, container.y, container.width, container.height);
      });
    }

    this.useContext(c => {
      c.fillStyle = opts.color || 'black';
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      const textSize = this.getTextSizeForContainer(opts.text, this._fontFamily, opts.fontSize, container, 2);

      c.font = `${textSize}px Arial`;
      const containerCenter = getCenter(container);
      c.fillText(opts.text, containerCenter.x, containerCenter.y);
    });

    return container;
  }

  async drawImage(opts: DrawImageOptions) {
    const imageResult = await FileStore.loadImage(opts.filePath);

    if (!imageResult.ok) {
      throw 'failed to load image';
    }

    const img = await createImageElement(opts.filePath, opts.size.width, opts.size.height);

    // calculate diff between desired size and the fit size to offset the rendering
    const offsets = { x: Math.floor((opts.size.width - img.width) / 2), y: Math.floor((opts.size.height - img.height) / 2) };

    this.useContext(c => {
      c.drawImage(img, this._pagePadding + opts.pos.x + offsets.x, this._pagePadding + opts.pos.y + offsets.y);

      c.strokeStyle = 'blue';
      c.lineWidth = 1;

      c.strokeRect(opts.pos.x, opts.pos.y, opts.size.width, opts.size.height);
    });

    return createArea(opts.pos, opts.size);
  }

  private getTextSizeForContainer(text: string, fontFamily: string, maxFontSize: number, area: Size, ratio = 1) {
    let curSize = maxFontSize;

    const c = this._ctx;

    c.save();

    c.font = curSize + 'px ' + fontFamily;
    let textMetrics = c.measureText(text);
    let actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let actualWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;

    while (actualWidth * ratio > area.width || actualHeight * ratio > area.height) {
      curSize -= 1;

      if (curSize <= 0) {
        curSize = 0;
        break;
      }

      c.font = curSize + 'px ' + fontFamily;
      textMetrics = c.measureText(text);
      actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
      actualWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
    }

    c.restore();

    return curSize;
  }

  private useContext(action: (ctx: CanvasRenderingContext2D) => void) {
    this._ctx.save();
    action(this._ctx);
    this._ctx.restore();
  }

  drawCard() {}

  toDataUrl() {
    return this._canvas.toDataURL();
  }
}
