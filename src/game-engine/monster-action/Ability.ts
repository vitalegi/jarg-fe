import { Monster } from "@/models/Character";
import RechargeFamily from "../turns/RechargeFamily";
import Type from "../types/Type";
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
    return out;
  }

  public validate(): void {
    if (this.power < 0) {
      throw Error(`Power must be >=0, actual ${this.power}`);
    }
    if (this.precision < 0) {
      throw Error(`Precision must be >=0, actual ${this.precision}`);
    }
    this.types.forEach(Type.validate);
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
