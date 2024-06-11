export interface Pos {
  x: number;
  y: number;
}

export interface PartialPos {
  x?: number;
  y?: number;
}

export class Position implements Pos {
  private _x = 0;
  private _y = 0;

  constructor(pos?: PartialPos) {
    if (pos) {
      this.set(pos);
    }
  }

  get x() {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
  }

  get y() {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
  }

  clone() {
    return new Position({ x: this._x, y: this._y });
  }

  set(pos: PartialPos) {
    if (pos.x != null) this._x = pos.x;
    if (pos.y != null) this._y = pos.y;

    return this;
  }

  setX(x: number) {
    this._x = x;
    return this;
  }

  setY(y: number) {
    this._y = y;
    return this;
  }

  add(pos: PartialPos) {
    if (pos.x != null) this._x += pos.x;
    if (pos.y != null) this._y += pos.y;

    return this;
  }

  addX(x: number) {
    this._x += x;
    return this;
  }

  addY(y: number) {
    this._y += y;
    return this;
  }

  static diff(a: Pos, b: Pos) {
    return new Position({ x: a.x - b.x, y: a.y - b.y });
  }
}
