import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import Container from "typedi";
import Ability from "./Ability";

export default class AbilityExecutor {
  protected gameService = Container.get<GameService>(GameService);
  protected source: Monster;
  protected target: Monster;
  protected ability: Ability;

  public constructor(source: Monster, target: Monster, ability: Ability) {
    this.source = source;
    this.target = target;
    this.ability = ability;
  }

  public async execute(): Promise<void> {
    const processor = this.ability.getProcessor(this.source, this.target);
    const effects = processor.execute();
    effects.forEach((effect) => effect.apply(this.target));

    console.log(
      `Target: ${this.target.uuid}, action: ${
        this.ability.label
      }, effects: ${JSON.stringify(effects)}. HP of ${this.target.uuid}: ${
        this.target.stats.hp
      }/${this.target.stats.maxHP}`
    );

    if (this.gameService.isDead(this.target.uuid)) {
      await this.gameService.die(this.target.uuid);
    }
  }
}
