import * as PIXI from "pixi.js";
import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import Container from "typedi";
import AbilityName from "../ui/AbilityName";
import Ability from "./Ability";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import HealthBarService from "../monster/HealthBarService";
import TextOverCharacter from "../ui/TextOverCharacter";

export default class AbilityExecutor {
  protected gameService = Container.get<GameService>(GameService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);
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

    const hits = processor.hit();
    await this.showAbilityName();

    if (hits) {
      const effects = processor.execute();

      const msg = effects.map((e) => e.textualEffect(this.target)).join("\n");
      this.gameService.addGameLoopHandler(
        new TextOverCharacter(this.target, msg)
      );

      effects.forEach((effect) => effect.apply(this.target));

      console.log(
        `Target: ${this.target.uuid}, action: ${
          this.ability.label
        }, effects: ${JSON.stringify(effects)}. HP of ${this.target.uuid}: ${
          this.target.stats.hp
        }/${this.target.stats.maxHP}`
      );

      const battleContainer = this.gameService.getBattleContainer();
      const monsterContainer = battleContainer.getChildByName(
        this.target.uuid
      ) as PIXI.Container;

      this.healthBarService.updateBar(
        monsterContainer,
        this.target,
        this.gameService.getMap().options
      );
    } else {
      console.log("Miss");
      this.gameService.addGameLoopHandler(TextOverCharacter.miss(this.target));
    }

    if (this.gameService.isDead(this.target.uuid)) {
      const exp = this.levelUpService.getKillExperience(this.target);
      await this.gameService.die(this.target.uuid);
      await this.levelUpService.gainExperience(this.source, exp);
    }
  }

  protected async showAbilityName(): Promise<void> {
    console.log(`show ability name ${this.ability.label}`);
    await new AbilityName(this.ability.label).execute();
  }
}
