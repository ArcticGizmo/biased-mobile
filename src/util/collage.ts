import { KPopCard, OwnershipType } from '@/types';
import { CanvasDrawer } from './canvasDrawer';
import { Pos, Position, Size } from './position';
import { checkmarkCircle, heart, paperPlane } from 'ionicons/icons';

const PAGE_TITLE_SIZE = 150;
const SECTION_TITLE_SIZE = 25;
const VERSION_SIZE = 16;
const CARD_ASPECT_RATIO = 0.7;
const CARD_GAP = 5;
const SECTION_GAP = CARD_GAP * 3;
const OWNERSHIP_BORDER_WIDTH = 2;

export interface CollageOptions {
  pageSize: Size;
  pagePadding: number;
  cardHeight: number;
  showOwnership?: boolean;
}

interface CardRegion {
  totalSize: Size;
  gapRight: number;
  cardSize: Size;
  versionSize: Size;
}

const createCardRegion = (cardHeight: number): CardRegion => {
  const cardWidth = cardHeight * CARD_ASPECT_RATIO;

  return {
    totalSize: { width: cardWidth + CARD_GAP, height: cardHeight + VERSION_SIZE },
    gapRight: CARD_GAP,
    cardSize: { width: cardWidth, height: cardHeight },
    versionSize: { width: cardWidth, height: VERSION_SIZE }
  };
};

const getSvg = (ownershipType: OwnershipType) => {
  switch (ownershipType) {
    case 'have':
      return svgWithFill(checkmarkCircle, getFillColor(ownershipType));
    case 'in-transit':
      return svgWithFill(paperPlane, getFillColor(ownershipType));
    case 'want':
      return svgWithFill(heart, getFillColor(ownershipType));
    default:
      return;
  }
};

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

const svgWithFill = (dataUrl: string, color: string) => dataUrl.replace('<svg', `<svg fill='${color}'`);

export class Collage {
  private _pageSize: Size;
  private _pagePadding = 0;
  private _maxWidth = 0;
  private _maxHeight = 0;

  private _cardRegion: CardRegion;
  private _showOwnership = false;
  private _isFull = false;

  private _pos = new Position();
  private _canvasDrawer: CanvasDrawer;

  constructor(opts: CollageOptions) {
    this._pageSize = { ...opts.pageSize };
    this._pagePadding = opts.pagePadding;
    this._showOwnership = opts.showOwnership || false;

    this._maxWidth = opts.pageSize.width - this._pagePadding * 2;
    this._maxHeight = opts.pageSize.height - this._pagePadding * 2;

    this._cardRegion = createCardRegion(opts.cardHeight);

    this._pos.add(this._pagePadding);

    this._canvasDrawer = new CanvasDrawer(this._pageSize, 'white');
  }

  get isFull() {
    return this._isFull;
  }

  private markAsFull() {
    return (this._isFull = true);
  }

  reset() {
    this._pos = new Position().add(this._pagePadding);
    this._canvasDrawer.reset();
  }

  // returns true if there is no more room left for the cards
  async addSection(title: string, cards: KPopCard[]) {
    const cardsRemainingInRow = this.cardsRemainingInRow(this._pos.x);

    // if there is not enough room in the row, move to the next row
    if (cardsRemainingInRow !== this.maxCardsInRow() && cards.length > cardsRemainingInRow) {
      this.moveToNewLine();
    }

    // check if there is enough height left
    const maxRowsLeft = this.maxRowsLeft(this._pos.y);
    const rowsRequired = Math.ceil(cards.length / this.maxCardsInRow());

    if (rowsRequired > maxRowsLeft) {
      this.markAsFull();
      return;
    }

    // draw the section title
    const cardsInRow = Math.min(cards.length, this.cardsRemainingInRow(this._pos.x));
    const titleWidth = this._cardRegion.totalSize.width * cardsInRow - this._cardRegion.gapRight;
    const titleBounds = this.addSectionTitle(title, titleWidth);

    // bump down from the title to start adding cards
    const localPos = this._pos.clone().addY(titleBounds.height);

    let usedMultipleLines = false;

    for (const card of cards) {
      // if we cannot fit the width, go to the next line
      if (!this.canFitCardWidth(localPos)) {
        usedMultipleLines = true;
        localPos.x = this._pagePadding;
        localPos.y += this._cardRegion.totalSize.height + CARD_GAP;
      }

      // draw the card itself
      const bounds = await this._canvasDrawer.drawImage({
        filePath: card.imageFilePath,
        pos: localPos,
        size: this._cardRegion.cardSize
      });

      // draw the version (if required)
      if (card.albumVersion) {
        this._canvasDrawer.drawText({
          text: card.albumVersion,
          pos: localPos.clone().addY(this._cardRegion.cardSize.height),
          fontSize: (VERSION_SIZE / 3) * 2,
          size: { width: this._cardRegion.versionSize.width, height: VERSION_SIZE },
          factor: 1
        });
      }

      // if render ownership
      if (this._showOwnership) {
        const svg = getSvg(card.ownershipType);
        if (svg) {
          const svgSize = this._cardRegion.cardSize.width * 0.25;
          await this._canvasDrawer.drawSvg({ svg, pos: localPos, size: { width: svgSize, height: svgSize } });

          // draw the border
          this._canvasDrawer.drawRect({
            pos: localPos,
            size: {
              width: this._cardRegion.cardSize.width,
              height: this._cardRegion.totalSize.height
            },
            borderWidth: OWNERSHIP_BORDER_WIDTH,
            borderColor: getFillColor(card.ownershipType)
          });
        }
      }

      localPos.addX(bounds.width + this._cardRegion.gapRight);
    }

    if (usedMultipleLines) {
      this._pos.y = localPos.y - SECTION_TITLE_SIZE;
      this.moveToNewLine();
    } else {
      this._pos.x = localPos.x + SECTION_GAP;
    }
  }

  private canFitCardWidth(pos: Pos) {
    return pos.x + this._cardRegion.cardSize.width < this._maxWidth;
  }

  private maxRowsLeft(yPos: number) {
    const heightRemaining = this._maxHeight + this._pagePadding - SECTION_TITLE_SIZE - yPos;
    const height = this._cardRegion.totalSize.height + SECTION_GAP;
    return Math.floor(heightRemaining / height);
  }

  private maxCardsInRow() {
    return Math.floor((this._maxWidth + this._cardRegion.gapRight) / this._cardRegion.totalSize.width);
  }

  private cardsRemainingInRow(xPos: number) {
    return Math.floor((this._maxWidth + this._cardRegion.gapRight - xPos) / this._cardRegion.totalSize.width);
  }

  private moveToNewLine() {
    this._pos.x = this._pagePadding;
    this._pos.y += SECTION_TITLE_SIZE + SECTION_GAP + this._cardRegion.totalSize.height;
  }

  addPageTitle(text: string) {
    const titleBounds = this._canvasDrawer.drawText({
      text,
      pos: this._pos,
      fontSize: PAGE_TITLE_SIZE,
      size: { width: this._maxWidth, height: PAGE_TITLE_SIZE },
      fontFamily: "'Brush Script MT', cursive",
      backgroundColor: '#F1F1F1',
      factor: 2
    });

    this._pos.addY(titleBounds.height + 5);
  }

  private addSectionTitle(text: string, width: number) {
    return this._canvasDrawer.drawText({
      text,
      pos: this._pos,
      fontSize: SECTION_TITLE_SIZE,
      size: { width, height: SECTION_TITLE_SIZE },
      color: 'white',
      backgroundColor: '#B6B6B6',
      factor: 1.5
    });
  }

  toDataUrl() {
    return this._canvasDrawer.toDataUrl();
  }
}
