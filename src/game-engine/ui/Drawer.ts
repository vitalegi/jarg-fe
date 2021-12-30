import TimeUtil from "@/utils/TimeUtil";
import UuidUtil from "@/utils/UuidUtil";

export default abstract class Drawer {
  private _id;
  private _completed = false;
  private _drawCount = 0;
  private _startTime = 0;

  public constructor() {
    this._id = UuidUtil.nextId();
  }

  public draw(): void {
    const timestamp = TimeUtil.timestamp();
    if (this.isFirstDraw()) {
      this._startTime = TimeUtil.timestamp();
    }
    this.doDraw();
    this._drawCount++;

    const duration = Math.round(100 * (TimeUtil.timestamp() - timestamp)) / 100;
    console.info(
      `MONITORING Drawer id=${this.getId()}, name=${this.getName()}, time_taken=${duration}ms`
    );
  }

  protected abstract doDraw(): void;

  public isFirstDraw(): boolean {
    return this._drawCount === 0;
  }

  public completed(): boolean {
    return this._completed;
  }

  public getId(): string {
    return this._id;
  }

  protected abstract getName(): string;

  public startTime(): number {
    return this._startTime;
  }

  protected complete(): void {
    this._completed = true;
  }
}
