import TypeConstants from "@/game-engine/types/TypeConstants";
import NumberUtil from "@/utils/NumberUtil";
import RechargeFamily from "../../battle/RechargeFamily";
import StatsConstants from "../../monster/stats/StatsContants";
import AbstractProcessor from "../ability-processor/AbstractProcessor";
import DefaultProcessor from "../ability-processor/DefaultProcessor";
import AbilityTarget from "../ability-target/AbilityTarget";
import Effect from "../effects/effect/Effect";
import EffectFactory from "../effects/effect/EffectFactory";
import Usages from "../Usages";

export default class Ability {
  id = "";
  label = "";
  description = "";
  notes = "";
  power = 0;
  types: string[] = [];
  rechargeFamily = 0;
  precision = 0;
  atkStat: string | null = "";
  defStat: string | null = "";
  usages = new Usages();
  abilityTarget = new AbilityTarget();
  damage = false;
  additionalEffects: Effect[] = [];

  public constructor(label = "") {
    this.label = label;
  }

  public static fromJson(json: any): Ability {
    const out = new Ability();
    out.id = json.id;
    out.label = json.label;
    out.description = json.description;
    out.notes = json.notes;
    out.power = parseInt(json.power, 10);
    out.precision = parseInt(json.precision, 10);
    if (json.types) {
      out.types.push(...(json.types as string[]));
    }
    out.rechargeFamily = NumberUtil.parse(json.rechargeFamily);
    out.atkStat = json.atkStat;
    if (out.atkStat === "") {
      out.atkStat = null;
    }
    out.defStat = json.defStat;
    if (out.defStat === "") {
      out.defStat = null;
    }
    if (json.usages) {
      out.usages = Usages.fromJson(json.usages);
    }
    out.abilityTarget = AbilityTarget.fromJson(json.abilityTarget);
    out.damage = json.damage;
    if (json.additionalEffects) {
      out.additionalEffects = json.additionalEffects.map(
        EffectFactory.fromJson
      );
    }
    return out;
  }

  public clone(): Ability {
    const out = new Ability();
    out.id = this.id;
    out.label = this.label;
    out.description = this.description;
    out.notes = this.notes;
    out.power = this.power;
    out.precision = this.precision;
    this.types.forEach((type) => out.types.push(type));
    out.rechargeFamily = this.rechargeFamily;
    out.atkStat = this.atkStat;
    out.defStat = this.defStat;
    out.usages = this.usages.clone();
    out.abilityTarget = this.abilityTarget.clone();
    out.damage = this.damage;
    out.additionalEffects = this.additionalEffects.map((e) => e.clone());
    return out;
  }

  public toJson(): any {
    const out: any = {};
    out.id = this.id;
    out.label = this.label;
    out.description = this.description;
    out.notes = this.notes;
    out.power = this.power;
    out.precision = this.precision;
    out.types = new Array<string>();
    this.types.forEach((type) => out.types.push(type));
    out.rechargeFamily = this.rechargeFamily;
    out.atkStat = this.atkStat;
    out.defStat = this.defStat;
    out.usages = this.usages.toJson();
    out.abilityTarget = this.abilityTarget.toJson();
    out.damage = this.damage;
    out.additionalEffects = this.additionalEffects.map((e) => e.toJson());
    return out;
  }

  public isValid(): boolean {
    try {
      this.validate();
      return true;
    } catch (e) {
      return false;
    }
  }
  public validate(): void {
    if (this.id.trim() === "") {
      throw Error(`ID must not be null`);
    }
    if (this.label.trim() === "") {
      throw Error(`Label must not be null`);
    }
    if (this.description.trim() === "") {
      throw Error(`Description must not be null`);
    }
    if (this.power < 0) {
      throw Error(`Power must be >=0, actual ${this.power}`);
    }
    if (this.precision < 0) {
      throw Error(`Precision must be >=0, actual ${this.precision}`);
    }
    if (this.types.length === 0) {
      throw Error(`Must have at least one type`);
    }
    this.types.forEach((type) => {
      if (TypeConstants.getTypes().indexOf(type) === -1) {
        throw Error(`Type ${type} is not recognized`);
      }
    });
    this.usages.validate();
    this.abilityTarget.validate();
    RechargeFamily.validate(this.rechargeFamily);
    if (this.damage) {
      if (
        this.atkStat !== StatsConstants.ATK &&
        this.atkStat !== StatsConstants.INT
      ) {
        throw Error(`AtkStat ${this.atkStat} is not valid.`);
      }
      if (
        this.defStat !== StatsConstants.DEF &&
        this.defStat !== StatsConstants.RES
      ) {
        throw Error(`DefStat ${this.defStat} is not valid.`);
      }
    }
    this.additionalEffects.forEach((e) => e.validate());
  }

  public getProcessor(): AbstractProcessor {
    return new DefaultProcessor();
  }
}
