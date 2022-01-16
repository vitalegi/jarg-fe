export default class Stats {
  hp = 0;
  maxHP = 0;
  atk = 0;
  def = 0;
  int = 0;
  res = 0;
  hit = 0;
  dex = 0;
  speed = 0;

  public constructor(
    hp = 0,
    maxHP = 0,
    atk = 0,
    def = 0,
    int = 0,
    res = 0,
    hit = 0,
    dex = 0,
    speed = 0
  ) {
    this.hp = hp;
    this.maxHP = maxHP;
    this.atk = atk;
    this.def = def;
    this.int = int;
    this.res = res;
    this.hit = hit;
    this.dex = dex;
    this.speed = speed;
  }

  public static fromJson(data: any): Stats {
    const out = new Stats();
    if (!data) {
      return out;
    }
    out.hp = data.hp;
    out.maxHP = data.maxHP;
    out.atk = data.atk;
    out.def = data.def;
    out.int = data.int;
    out.res = data.res;
    out.hit = data.hit;
    out.dex = data.dex;
    out.speed = data.speed;

    return out;
  }

  public clone(): Stats {
    const out = new Stats();

    out.hp = this.hp;
    out.maxHP = this.maxHP;
    out.atk = this.atk;
    out.def = this.def;
    out.int = this.int;
    out.res = this.res;
    out.hit = this.hit;
    out.dex = this.dex;
    out.speed = this.speed;

    return out;
  }

  public totalPoints(): number {
    return (
      this.maxHP +
      this.atk +
      this.def +
      this.int +
      this.res +
      this.hit +
      this.dex +
      this.speed
    );
  }

  public toString(): string {
    return `HP=${this.hp}, maxHP=${this.maxHP}, ATK=${this.atk}, DEF=${this.def}, INT=${this.int}, RES=${this.res}, HIT=${this.hit}, DEX=${this.dex}, speed=${this.speed}`;
  }
}
