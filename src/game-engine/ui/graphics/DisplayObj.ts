import * as PIXI from "pixi.js";

export default interface DisplayObj {
  setX(x: number): void;
  setY(y: number): void;
  disabled(): boolean;
  update(): void;
  getWidth(): number;
  getHeight(): number;
  getContainer(): PIXI.Container;
}
