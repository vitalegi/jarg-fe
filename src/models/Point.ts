export default class Point {
  x: number;
  y: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public clone(): Point {
    return new Point(this.x, this.y);
  }

  public static fromJson(obj: any): Point {
    const out = new Point();
    if (obj.x) {
      out.x = obj.x;
    }
    if (obj.y) {
      out.y = obj.y;
    }
    return out;
  }

  public equals(point: Point | null): boolean {
    if (!point) {
      return false;
    }
    return this.x === point.x && this.y === point.y;
  }

  public toString(): string {
    return `Point(x=${this.x}, y=${this.y})`;
  }
}
