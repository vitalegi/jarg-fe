import { asInt, asString } from "@/utils/JsonUtil";

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
    out.evolutionId = asString(data.evolutionId);
    out.type = asString(data.type);
    out.level = asInt(data.level);
    return out;
  }

  public clone(): MonsterEvolution {
    const out = new MonsterEvolution();
    out.evolutionId = this.evolutionId;
    out.type = this.type;
    out.level = this.level;
    return out;
  }

  public equals(other: MonsterEvolution): boolean {
    return (
      this.type === other.type &&
      this.evolutionId === other.evolutionId &&
      this.level === other.level
    );
  }

  public isByLevel(): boolean {
    return this.type === MonsterEvolution.LEVEL_TYPE;
  }
}
