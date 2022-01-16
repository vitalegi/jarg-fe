export default class MonsterEvolution {
  public static LEVEL_TYPE = "BY_LEVEL";

  evolutionId = "";
  type = "";
  level = 0;

  public static byLevel(evolutionId: string, level: number): MonsterEvolution {
    const e = new MonsterEvolution();
    e.type = MonsterEvolution.LEVEL_TYPE;
    e.level = level;
    return e;
  }

  public static fromJson(data: any): MonsterEvolution {
    const out = new MonsterEvolution();
    out.evolutionId = data.evolutionId;
    out.type = data.type;
    out.level = data.level;
    return out;
  }

  public clone(): MonsterEvolution {
    const out = new MonsterEvolution();
    out.evolutionId = this.evolutionId;
    out.type = this.type;
    out.level = this.level;
    return out;
  }
}
