import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import Monster from "@/game-engine/monster/Monster";
import Container, { Service } from "typedi";
import Ability from "../ability/Ability";
import AbilityExecutor from "../AbilityExecutor";
import MonsterMove from "../MonsterMove";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapRepository from "@/game-engine/map/MapRepository";
import BattleService from "@/game-engine/battle/BattleService";
import SelectTargetMove from "../SelectTargetMove";
import SelectTargetAbility from "../SelectTargetAbility";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityLearned from "../ability/AbilityLearned";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";

@Service()
export default class MonsterActionMenuBuilder {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.UI.MonsterActionMenuBUilder"
  );

  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);

  public build(monster: Monster): LeftMenu {
    const leftMenu = new LeftMenu();
    leftMenu.addEntry(this.move(leftMenu, monster));
    monster.abilities
      .map((ability) => this.abilityMenuEntry(leftMenu, monster, ability))
      .forEach((m) => leftMenu.addEntry(m));
    leftMenu.addEntry(this.endTurn(leftMenu));
    return leftMenu;
  }

  protected move(leftMenu: LeftMenu, monster: Monster): MenuEntry {
    return new MenuEntry(
      "Move",
      () => this.onMoveClick(leftMenu, monster),
      () => this.monsterService.canActiveMonsterMove()
    );
  }

  protected async onMoveClick(
    leftMenu: LeftMenu,
    monster: Monster
  ): Promise<void> {
    leftMenu.hide();
    const path = await new SelectTargetMove().selectTarget(monster);
    if (path) {
      await new MonsterMove(monster, path).execute();
      this.logger.info(`Walk to ${path[path.length - 1]} is completed.`);
      leftMenu.reDraw();
    }
    leftMenu.show();
  }

  protected endTurn(leftMenu: LeftMenu): MenuEntry {
    return new MenuEntry(
      "End Turn",
      () => {
        leftMenu.destroy();
        this.getBattleService().nextTurn();
      },
      () => true
    );
  }

  protected abilityMenuEntry(
    leftMenu: LeftMenu,
    monster: Monster,
    learned: AbilityLearned
  ): MenuEntry {
    const ability = this.abilityRepository.getAbility(learned.abilityId);
    return new MenuEntry(
      ability.label,
      () => this.onAbilityClick(leftMenu, monster, ability),
      () => this.isAbilityEnabled(learned)
    );
  }

  protected async onAbilityClick(
    leftMenu: LeftMenu,
    monster: Monster,
    ability: Ability
  ): Promise<void> {
    leftMenu.hide();
    const targetId = await new SelectTargetAbility().selectTarget(
      monster,
      ability
    );
    if (targetId) {
      const target = this.mapRepository.getMonsterById(targetId);
      this.logger.info(
        `Selected target of ability ${ability.label}: ${targetId} / ${target.name}`
      );
      const executor = new AbilityExecutor(monster, target, ability);
      await executor.execute();
      this.logger.info(`User ability ${ability.label} is completed.`);
      leftMenu.reDraw();
      if (this.getBattleService().isBattleOver()) {
        this.getBattleService().completeBattle();
      }
    }
    leftMenu.show();
  }

  protected isAbilityEnabled(ability: AbilityLearned): boolean {
    if (!this.monsterService.canActiveMonsterUseAbility()) {
      this.logger.debug(`Ability slots already consumed for this turn`);
      return false;
    }
    if (!(ability.currentUsages > 0)) {
      this.logger.debug(`No more ability usages for ${ability.abilityId}`);
      return false;
    }
    this.logger.debug(`Ability ${ability.abilityId} is enabled`);
    return true;
  }

  protected getBattleService(): BattleService {
    return Container.get<BattleService>(BattleService);
  }
}
