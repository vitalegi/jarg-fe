export default class Point {
  x: number;
  y: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public static create(obj: any): Point {
    const out = new Point();
    if (obj.x) {
      out.x = obj.x;
    }
    if (obj.y) {
      out.y = obj.y;
    }
    return out;
  }

  public toString(): string {
    return `Point(x=${this.x}, y=${this.y})`;
  }
}
