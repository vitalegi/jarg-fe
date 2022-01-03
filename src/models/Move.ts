export default class Move {
  steps = 0;

  canWalk = false;
  canFly = false;

  public static fromJson(data: any): Move {
    const out = new Move();
    if (!data) {
      return out;
    }
    out.steps = data.steps;
    out.canWalk = data.canWalk;
    out.canFly = data.canFly;
    return out;
  }
}
