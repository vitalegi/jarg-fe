export class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;

  public constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public toString(): string {
    return `Rectangle(x=${this.x}, y=${this.y}, width=${this.width}, height=${this.height})`;
  }
}
