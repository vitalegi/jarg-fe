import * as PIXI from "pixi.js";
import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import Container from "typedi";
import AbilityNameDrawer from "../ui/AbilityNameDrawer";
import Ability from "./Ability";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import HealthBarService from "../monster/HealthBarService";
import TextOverCharacter from "../ui/TextOverCharacterDrawer";
import AbilityEffect from "./AbilityEffect";
import HealthBarUpdateDrawer from "../ui/HealthBarUpdateDrawer";
import ChangeFocusDrawer from "../ui/ChangeFocusDrawer";

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
    this.ability.usages.current--;
    const processor = this.ability.getProcessor(this.source, this.target);

    const hits = processor.hit();
    await this.focusTarget();
    const abilityDrawer = this.showAbilityName();

    if (hits) {
      const effects = processor.execute();

      const effectsDrawer = this.showAbilityEffects(effects);
      await this.waitCompletion([abilityDrawer, effectsDrawer]);

      const fromHP = this.target.stats.hp;
      effects.forEach((effect) => effect.apply(this.target));
      const toHP = this.target.stats.hp;

      console.log(
        `Target: ${this.target.uuid}, action: ${
          this.ability.label
        }, effects: ${JSON.stringify(effects)}. HP of ${this.target.uuid}: ${
          this.target.stats.hp
        }/${this.target.stats.maxHP}`
      );
      const healthUpdater = new HealthBarUpdateDrawer(
        this.target,
        fromHP,
        toHP
      );
      this.gameService.addGameLoopHandler(healthUpdater);
      await healthUpdater.notifyWhenCompleted();
    } else {
      console.log("Miss");
      const effectsDrawer = this.showMiss();
      await this.waitCompletion([abilityDrawer, effectsDrawer]);
    }

    if (this.gameService.isDead(this.target.uuid)) {
      const exp = this.levelUpService.getKillExperience(this.target);
      await this.gameService.die(this.target.uuid);
      await this.levelUpService.gainExperience(this.source, exp);
    }
  }

  protected focusTarget(): Promise<void> {
    if (this.target.coordinates) {
      const focus = new ChangeFocusDrawer(this.target.coordinates);
      this.gameService.addGameLoopHandler(focus);
      return focus.notifyWhenCompleted();
    }
    return Promise.resolve();
  }

  protected async showAbilityName(): Promise<void> {
    console.log(`show ability name ${this.ability.label}`);
    const ability = new AbilityNameDrawer(this.ability.label);
    this.gameService.addGameLoopHandler(ability);
    return ability.notifyWhenCompleted();
  }

  protected showAbilityEffects(effects: AbilityEffect[]): Promise<void> {
    const msg = effects.map((e) => e.textualEffect(this.target)).join("\n");
    const drawer = new TextOverCharacter(this.target, msg);
    this.gameService.addGameLoopHandler(drawer);
    return drawer.notifyWhenCompleted();
  }

  protected showMiss(): Promise<void> {
    const drawer = TextOverCharacter.miss(this.target);
    this.gameService.addGameLoopHandler(drawer);
    return drawer.notifyWhenCompleted();
  }

  protected async waitCompletion(promises: Promise<void>[]): Promise<void> {
    await Promise.all(promises);
  }
}
