import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import Ability from "../Ability";
import AbilityExecutor from "../AbilityExecutor";

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
    const ability = this.getAbility(target);

    const executor = new AbilityExecutor(this.source, target, ability);
    await executor.execute();
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

  protected getAbility(target: Monster): Ability {
    return this.source.abilities[
      this.randomService.randomInt(this.source.abilities.length)
    ];
  }
}
