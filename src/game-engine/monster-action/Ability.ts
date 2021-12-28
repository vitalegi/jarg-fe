import { Monster } from "@/models/Character";
import SingleTargetAbility from "./SingleTargetAbility";

export default class Ability {
  label = "";

  public constructor(label = "") {
    this.label = label;
  }

  public static fromJson(json: any): Ability {
    const out = new Ability();
    out.label = json.label;
    return out;
  }

  public getProcessor(source: Monster, target: Monster): SingleTargetAbility {
    return new SingleTargetAbility(source, target);
  }
}
