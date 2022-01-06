import RechargeFamily from "../battle/RechargeFamily";
import StatsConstants from "../monster/stats/StatsContants";
import AbstractProcessor from "./ability-processor/AbstractProcessor";
import DefaultProcessor from "./ability-processor/DefaultProcessor";
import ProcessorFactory from "./ability-processor/ProcessorFactory";
import AbilityTarget from "./ability-target/AbilityTarget";
import Usages from "./Usages";

export default class Ability {
  id = "";
  label = "";
  power = 0;
  types: string[] = [];
  rechargeFamily = 0;
  precision = 0;
  atkStat: string | null = "";
  defStat: string | null = "";
  usages = new Usages();
  abilityTarget = new AbilityTarget();
  processor: AbstractProcessor = new DefaultProcessor();

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
    out.abilityTarget = AbilityTarget.fromJson(json.abilityTarget);
    out.processor = ProcessorFactory.fromJson(json.processor);

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
    out.abilityTarget = this.abilityTarget.clone();
    out.processor = this.processor.clone();
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
    if (
      this.atkStat !== null &&
      this.atkStat !== StatsConstants.ATK &&
      this.atkStat !== StatsConstants.INT
    ) {
      throw Error(`AtkStat ${this.atkStat} is not valid.`);
    }
    if (
      this.defStat !== null &&
      this.defStat !== StatsConstants.DEF &&
      this.defStat !== StatsConstants.RES
    ) {
      throw Error(`DefStat ${this.defStat} is not valid.`);
    }
  }
}
