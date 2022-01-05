import { Monster } from "@/models/Character";
import RechargeFamily from "../battle/RechargeFamily";
import Type from "../types/Bonus";
import SingleTargetAbility from "./SingleTargetAbility";

export class Usages {
  current = 0;
  max = 0;

  public static fromJson(json: any): Usages {
    const out = new Usages();
    out.current = json.current;
    out.max = json.max;
    return out;
  }
  public clone(): Usages {
    const out = new Usages();
    out.current = this.current;
    out.max = this.max;
    return out;
  }

  public validate(): void {
    if (this.current < 0) {
      throw Error(`Current must be >=0, actual ${this.current}`);
    }
    if (this.max < 0) {
      throw Error(`Max must be >=0, actual ${this.max}`);
    }
  }
}

export class Target {
  range = 0;

  public static fromJson(json: any): Target {
    const out = new Target();
    out.range = json.range;
    return out;
  }
  public clone(): Target {
    const out = new Target();
    out.range = this.range;
    return out;
  }

  public validate(): void {
    if (this.range < 0) {
      throw Error(`Range must be >=0, actual ${this.range}`);
    }
  }
}
export default class Ability {
  id = "";
  label = "";
  power = 0;
  types: string[] = [];
  rechargeFamily = 0;
  precision = 0;
  atkStat = "";
  defStat = "";
  usages = new Usages();
  target = new Target();

  public constructor(label = "") {
    this.label = label;
  }

  public static fromJson(json: any): Ability {
    const out = new Ability();
    out.id = json.id;
    out.label = json.label;
    out.power = json.power;
    out.precision = json.precision;
    if (json.types) {
      out.types.push(...(json.types as string[]));
    }
    out.rechargeFamily = json.rechargeFamily;
    out.atkStat = json.atkStat;
    out.defStat = json.defStat;
    if (json.usages) {
      out.usages = Usages.fromJson(json.usages);
    }
    out.target = Target.fromJson(json.target);
    return out;
  }

  public clone(): Ability {
    const out = new Ability();
    out.id = this.id;
    out.label = this.label;
    out.power = this.power;
    out.precision = this.precision;
    this.types.forEach((type) => out.types.push(type));
    out.rechargeFamily = this.rechargeFamily;
    out.atkStat = this.atkStat;
    out.defStat = this.defStat;
    out.usages = this.usages.clone();
    out.target = this.target.clone();
    return out;
  }

  public validate(): void {
    if (this.power < 0) {
      throw Error(`Power must be >=0, actual ${this.power}`);
    }
    if (this.precision < 0) {
      throw Error(`Precision must be >=0, actual ${this.precision}`);
    }
    RechargeFamily.validate(this.rechargeFamily);
    // TODO move to constants file
    if (this.atkStat !== "atk" && this.atkStat !== "int") {
      throw Error(`AtkStat ${this.atkStat} is not valid.`);
    }
    if (this.defStat !== "def" && this.defStat !== "res") {
      throw Error(`DefStat ${this.defStat} is not valid.`);
    }
  }

  public getProcessor(source: Monster, target: Monster): SingleTargetAbility {
    return new SingleTargetAbility(source, target, this);
  }
}
