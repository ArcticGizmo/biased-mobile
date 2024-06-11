import { Pos } from '@/util/position';

export interface CollageOptions {
  pageSize: Size;
  pagePadding: number;
}

export interface DrawTextOptions {
  text: string;
  pos: Pos;
  fontSize: number;
  size: Size;
  color?: string;
  backgroundColor?: string;
}

export interface Size {
  width: number;
  height: number;
}

type Area = Pos & Size;

interface Boundary {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const createArea = (pos: Pos, size: Size): Area => {
  return { x: pos.x, y: pos.y, width: size.width, height: size.height };
};

const getCenter = (area: Area) => {
  return { x: area.x + area.width / 2, y: area.y + area.height / 2 };
};

export class Collage {
  private _pageSize: Size;
  private _pagePadding = 0;
  private _workingArea: Boundary = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  private _fontFamily = 'Arial';

  // pos is always relative to working boundary
  private _canvas = document.createElement('canvas');
  private _ctx: CanvasRenderingContext2D;

  constructor(opts: CollageOptions) {
    this._pageSize = opts.pageSize;
    this._pagePadding = opts.pagePadding;

    const ctx = this._canvas.getContext('2d');

    if (!ctx) {
      throw 'Canvas not supported in this context';
    }

    this._ctx = ctx;

    this._recalculateWorkingBoundary();
  }

  get workingArea() {
    return { ...this._workingArea };
  }

  private _recalculateWorkingBoundary() {
    this._workingArea.minX = this._pagePadding;
    this._workingArea.minY = this._pagePadding;

    this._workingArea.maxX = this._pageSize.width - this._pagePadding;
    this._workingArea.maxY = this._pageSize.height - this._pagePadding;
  }

  private _willFit(area: Area) {
    const { minX, minY, maxX, maxY } = this._workingArea;
    return area.x >= minX && area.x <= maxX && area.y >= minY && area.y <= maxY;
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

      const textSize = this.getTextSizeForContainer(opts.text, this._fontFamily, opts.fontSize, container, 1.1);

      c.font = `${textSize}px Arial`;
      const containerCenter = getCenter(container);
      c.fillText(opts.text, containerCenter.x, containerCenter.y);
    });

    return container;
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
