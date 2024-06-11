import { KPopCard } from '@/types';
import { CanvasDrawer } from './canvasDrawer';
import { Position, Size } from './position';

const PAGE_TITLE_SIZE = 50;
const SECTION_TITLE_SIZE = 25;
const VERSION_SIZE = 12;
const CARD_ASPECT_RATIO = 0.7;
const CARD_GAP = 5;
const SECTION_GAP = CARD_GAP * 3;

export interface CollageOptions {
  pageSize: Size;
  padding: number;
  cardHeight: number;
}

export class Collage {
  private _pageSize: Size;
  private _padding = 0;
  private _maxWidth = 0;
  private _maxHeight = 0;

  private _cardHeight = 0;
  private _cardWidth = 0;

  private _pos = new Position();
  private _canvasDrawer: CanvasDrawer;

  constructor(opts: CollageOptions) {
    this._pageSize = { ...opts.pageSize };
    this._padding = opts.padding;

    this._maxWidth = opts.pageSize.width - this._padding * 2;
    this._maxHeight = opts.pageSize.height - this._padding * 2;

    this._cardHeight = opts.cardHeight;
    this._cardWidth = opts.cardHeight * CARD_ASPECT_RATIO;

    this._pos.add(this._padding);

    this._canvasDrawer = new CanvasDrawer(this._pageSize);
  }

  addPageTitle(text: string) {
    const titleBounds = this._canvasDrawer.drawText({
      text,
      pos: this._pos,
      fontSize: PAGE_TITLE_SIZE,
      size: { width: this._maxWidth, height: PAGE_TITLE_SIZE },
      backgroundColor: 'grey'
    });

    this._pos.addY(titleBounds.height);
  }

  async addSection(title: string, cards: KPopCard[]) {
    const remainingXSpace = this._maxWidth - this._pos.x;
    const canFitXCards = Math.floor(remainingXSpace / this.spaceRequiredForCard().width);

    if (canFitXCards >= cards.length) {
      return await this.addSingleRowSection(title, cards);
    }

    this.moveToNewLine();

    return await this.addMultiRowSection(title, cards);
  }

  private spaceRequiredForCard() {
    return { width: this._cardWidth + this._padding, height: this._cardHeight + VERSION_SIZE };
  }

  private moveToNewLine() {
    this._pos.x = this._padding;
    this._pos.y += SECTION_TITLE_SIZE + SECTION_GAP + this.spaceRequiredForCard().height;
  }

  private async addSingleRowSection(title: string, cards: KPopCard[]) {
    const titleBounds = this.addSectionTitle(title, this.spaceRequiredForCard().width * cards.length - this._padding);

    const localPos = this._pos.clone().addY(titleBounds.height);

    for (const card of cards) {
      const bounds = await this._canvasDrawer.drawImage({
        filePath: card.imageFilePath,
        pos: localPos,
        size: { width: this._cardWidth, height: this._cardHeight }
      });

      this._canvasDrawer.drawText({
        text: 'version',
        pos: localPos.clone().addY(this._cardHeight),
        fontSize: VERSION_SIZE,
        size: { width: this._cardWidth, height: VERSION_SIZE }
      });

      localPos.addX(bounds.width + this._padding);
    }

    // move across for next section
    this._pos.setX(localPos.x).addX(SECTION_GAP);
  }

  private async addMultiRowSection(title: string, cards: KPopCard[]) {
    const titleWidth = Math.min(this.spaceRequiredForCard().width * cards.length, this._maxWidth);
    const titleBounds = this.addSectionTitle(title, titleWidth - this._padding);

    const localPos = this._pos.clone().addY(titleBounds.height);

    for (const card of cards) {
      const spaceRemaining = this._maxWidth - localPos.x;

      if (spaceRemaining < this.spaceRequiredForCard().width) {
        localPos.x = this._padding;
        localPos.addY(this.spaceRequiredForCard().height + CARD_GAP);
      }

      const bounds = await this._canvasDrawer.drawImage({
        filePath: card.imageFilePath,
        pos: localPos,
        size: { width: this._cardWidth, height: this._cardHeight }
      });

      this._canvasDrawer.drawText({
        text: 'version',
        pos: localPos.clone().addY(this._cardHeight),
        fontSize: VERSION_SIZE,
        size: { width: this._cardWidth, height: VERSION_SIZE }
      });

      localPos.addX(bounds.width + this._padding);
    }

    // move across for next section
    this._pos.setX(localPos.x).addX(SECTION_GAP);
  }

  private addSectionTitle(text: string, width: number) {
    return this._canvasDrawer.drawText({
      text,
      pos: this._pos,
      fontSize: SECTION_TITLE_SIZE,
      size: { width, height: SECTION_TITLE_SIZE },
      backgroundColor: 'orange'
    });
  }

  toDataUrl() {
    return this._canvasDrawer.toDataUrl();
  }
}
