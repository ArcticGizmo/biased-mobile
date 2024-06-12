import type { Pos, Size } from '@/util/position';
import { FileStore } from '../composables/fileStore';
import { Base64Uri } from '../composables/base64';

export interface DrawTextOptions {
  text: string;
  pos: Pos;
  fontFamily?: string;
  fontSize: number;
  size: Size;
  color?: string;
  backgroundColor?: string;
  factor?: number;
}

export interface DrawImageOptions {
  filePath: string;
  pos: Pos;
  size: Size;
}

export interface DrawRectOptions {
  pos: Pos;
  size: Size;
  borderWidth: number;
  borderColor: string;
}

export interface DrawSvgOptions {
  svg: string;
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

  return await toImageElement(scaledData.toString());
};

const toImageElement = async (src: string): Promise<HTMLImageElement> => {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (error: any) => reject(error);

    img.src = src;
  });
};

export class CanvasDrawer {
  private _pageSize: Size;
  private _pagePadding = 0;

  // pos is always relative to working boundary
  private _canvas = document.createElement('canvas');
  private _ctx: CanvasRenderingContext2D;

  constructor(pageSize: Size, backgroundColor?: string) {
    this._pageSize = pageSize;
    this._canvas.width = pageSize.width;
    this._canvas.height = pageSize.height;

    const ctx = this._canvas.getContext('2d');

    if (!ctx) {
      throw 'Canvas not supported in this context';
    }

    this._ctx = ctx;

    if (backgroundColor) {
      this.useContext(c => {
        c.fillStyle = backgroundColor;
        c.fillRect(0, 0, pageSize.width, pageSize.height);
      });
    }
  }

  get width() {
    return this._pageSize.width;
  }

  get height() {
    return this._pageSize.height;
  }

  reset() {
    this._ctx.reset();
  }

  drawText(opts: DrawTextOptions) {
    const fontFamily = opts.fontFamily || 'Arial';
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

      const textSize = this.getTextSizeForContainer(opts.text, fontFamily, opts.fontSize, container, opts.factor || 1);

      c.font = `${textSize}px ${fontFamily}`;
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
    });

    return createArea(opts.pos, opts.size);
  }

  drawRect(opts: DrawRectOptions) {
    this.useContext(c => {
      c.lineWidth = opts.borderWidth;
      c.strokeStyle = opts.borderColor;
      c.strokeRect(opts.pos.x, opts.pos.y, opts.size.width, opts.size.height);
    });
  }

  async drawSvg(opts: DrawSvgOptions) {
    const img = await toImageElement(opts.svg);
    this.useContext(c => {
      c.drawImage(img, opts.pos.x, opts.pos.y, opts.size.width, opts.size.height);
    });
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

  useContext(action: (ctx: CanvasRenderingContext2D) => void) {
    this._ctx.save();
    action(this._ctx);
    this._ctx.restore();
  }

  toDataUrl() {
    return this._canvas.toDataURL();
  }
}
