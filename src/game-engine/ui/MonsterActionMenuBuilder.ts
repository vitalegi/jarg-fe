import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import Monster from "@/game-engine/model/monster/Monster";
import Container, { Service } from "typedi";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapRepository from "@/game-engine/map/MapRepository";
import BattleService from "@/game-engine/battle/BattleService";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import { gameLabel } from "@/services/LocalizationService";
import AbilityLearned from "@/game-engine/model/ability/AbilityLearned";
import SelectTargetMove from "@/game-engine/ability/SelectTargetMove";
import MonsterMove from "@/game-engine/ability/MonsterMove";
import SelectTargetCatch from "@/game-engine/ability/SelectTargetCatch";
import MonsterCatch from "@/game-engine/ability/MonsterCatch";
import Ability from "@/game-engine/model/ability/Ability";
import SelectTargetAbility from "@/game-engine/ability/SelectTargetAbility";
import AbilityExecutor from "@/game-engine/ability/AbilityExecutor";

@Service()
export default class MonsterActionMenuBuilder {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.UI.MonsterActionMenuBUilder"
  );

  protected monsterService = Container.get(MonsterService);
  protected mapRepository = Container.get(MapRepository);
  protected abilityRepository = Container.get(AbilityRepository);

  public build(monster: Monster): LeftMenu {
    const leftMenu = new LeftMenu();
    leftMenu.addEntry(this.move(leftMenu, monster));
    leftMenu.addEntry(this.catchMonster(leftMenu, monster));
    monster.abilities
      .map((ability) => this.abilityMenuEntry(leftMenu, monster, ability))
      .forEach((m) => leftMenu.addEntry(m));
    leftMenu.addEntry(this.endTurn(leftMenu));
    return leftMenu;
  }

  protected move(leftMenu: LeftMenu, monster: Monster): MenuEntry {
    return new MenuEntry(
      gameLabel("move"),
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
      this.logger.debug(`Walk to ${path[path.length - 1]} is completed.`);
      leftMenu.reDraw();
    }
    leftMenu.show();
  }

  protected catchMonster(leftMenu: LeftMenu, monster: Monster): MenuEntry {
    return new MenuEntry(
      gameLabel("catch"),
      () => this.onCatchClick(leftMenu, monster),
      () => this.monsterService.canActiveMonsterCatch()
    );
  }

  protected async onCatchClick(
    leftMenu: LeftMenu,
    monster: Monster
  ): Promise<void> {
    leftMenu.hide();
    const target = await new SelectTargetCatch().selectTarget(monster, 3);
    if (target) {
      await new MonsterCatch(monster, target).execute();
      leftMenu.reDraw();
    }
    leftMenu.show();
  }

  protected endTurn(leftMenu: LeftMenu): MenuEntry {
    return new MenuEntry(
      gameLabel("end-turn"),
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
    return Container.get(BattleService);
  }
}
