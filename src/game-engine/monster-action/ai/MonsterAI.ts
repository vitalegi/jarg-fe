import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import Ability from "../Ability";

export default class MonsterAI {
  protected gameService = Container.get<GameService>(GameService);
  protected randomService = Container.get<RandomService>(RandomService);

  protected source: Monster;

  public constructor(source: Monster) {
    this.source = source;
  }

  public async execute(): Promise<void> {
    const target = this.getTarget();
    if (target === null) {
      return;
    }
    const action = this.getAction(target);
    const processor = action.getProcessor(this.source, target);
    const effects = processor.execute();
    effects.forEach((effect) => effect.apply(target));

    console.log(
      `Target: ${target?.uuid}, action: ${
        action.label
      }, effects: ${JSON.stringify(effects)}. HP of ${target.uuid}: ${
        target.stats.hp
      }/${target.stats.maxHP}`
    );

    if (this.gameService.isDead(target.uuid)) {
      await this.gameService.die(target.uuid);
    }
  }

  protected getTarget(): Monster | null {
    const enemies = this.gameService
      .getMap()
      .monsters.filter((m) => m.ownerId !== this.source.ownerId);

    if (enemies.length === 0) {
      return null;
    }
    return enemies[this.randomService.randomInt(enemies.length)];
  }

  protected getAction(target: Monster): Ability {
    return this.source.abilities[
      this.randomService.randomInt(this.source.abilities.length)
    ];
  }
}
