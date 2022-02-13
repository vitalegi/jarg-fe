import * as PIXI from "pixi.js";
import AbilityService from "@/game-engine/ability/AbilityService";
import GameApp from "@/game-engine/GameApp";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import GameLoop from "@/game-engine/GameLoop";
import Monster from "@/game-engine/model/monster/Monster";
import HealthBarService from "@/game-engine/monster/HealthBarService";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import MonsterEvolutionService from "@/game-engine/monster/MonsterEvolutionService";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import PlayerService from "@/game-engine/PlayerService";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";
import RendererService from "@/game-engine/ui/RendererService";
import TextOverCharacterDrawer from "@/game-engine/ui/TextOverCharacterDrawer";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

@Service()
export default class EvolveFlow {
  logger = LoggerFactory.getLogger("GameEngine.Battle.EvolveFlow");

  private playerService = Container.get(PlayerService);
  private monsterEvolutionService = Container.get(MonsterEvolutionService);
  private monsterIndexService = Container.get(MonsterIndexService);
  private gameLoop = Container.get(GameLoop);
  private gameApp = Container.get(GameApp);
  private gameAppDataLoader = Container.get(GameAppDataLoader);
  private rendererService = Container.get(RendererService);
  private levelUpService = Container.get(LevelUpService);
  private abilityService = Container.get(AbilityService);
  private healthBarService = Container.get(HealthBarService);

  public async gainExpMonster(monster: Monster, exp: number): Promise<void> {
    if (exp <= 0.0001) {
      return;
    }
    const levelUp = this.levelUpService.canLevelUp(monster, exp);
    await this.levelUpService.gainExperience(monster, exp);
    if (!levelUp) {
      return;
    }
    this.logger.debug(`Show level up for ${monster.uuid}`);
    const drawer = new TextOverCharacterDrawer(monster, "LEVEL UP!");
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();

    // refresh health bar
    const monsterContainer = this.gameApp
      .getBattleContainer()
      .getChildByName(monster.uuid) as PIXI.Container;
    this.healthBarService.updateBar(
      monsterContainer,
      monster,
      monster.stats.hp
    );

    const newAbilities = this.abilityService.getNewLearnableAbilities(monster);
    if (newAbilities.length > 0) {
      if (monster.ownerId === this.playerService.getPlayerId()) {
        this.logger.debug(
          `A monster owned by the player (${monster.uuid}) learned new abilities, show message`
        );
        for (const newAbility of newAbilities) {
          const ability = this.abilityService.getAbility(newAbility.abilityId);
          const newAbilityMessage = new AbilityNameDrawer(ability.label);
          this.gameLoop.addGameLoopHandler(newAbilityMessage);
          await newAbilityMessage.notifyWhenCompleted();
        }
      }
      for (const newAbility of newAbilities) {
        this.abilityService.learnAbility(monster, newAbility.abilityId);
      }
    }
    await this.evolve(monster);
  }

  protected async evolve(monster: Monster): Promise<void> {
    if (monster.ownerId !== this.playerService.getPlayerId()) {
      return;
    }
    if (!this.monsterEvolutionService.canEvolve(monster)) {
      return;
    }
    const evolutions =
      this.monsterEvolutionService.getAvailableEvolutions(monster);
    this.logger.info(`Monster ${monster.uuid} can evolve.`);
    // TODO allow the user to select which evolution
    const target = evolutions[0];
    const newIndex = this.monsterIndexService.getMonster(target.evolutionId);

    const evolutionName = new AbilityNameDrawer(
      `${monster.name} evolves in ${newIndex.name}`
    );
    this.gameLoop.addGameLoopHandler(evolutionName);
    await evolutionName.notifyWhenCompleted();

    await this.gameAppDataLoader.loadMonstersSpriteSheets([newIndex]);
    this.monsterEvolutionService.evolve(monster, evolutions[0]);

    // replace sprites
    const battleContainer = this.gameApp.getBattleContainer();
    const oldContainer = battleContainer.getChildByName(monster.uuid);
    const newContainer = this.rendererService.createMonsterContainer(
      monster,
      newIndex,
      "normal"
    );

    // track new sprite
    const handler = this.gameLoop.getMonsterAnimationDrawer();
    handler.removeMonster(monster.uuid);
    handler.addMonster(
      monster.uuid,
      this.monsterIndexService.getMonster(monster.modelId),
      this.rendererService.getMonsterSprite(newContainer),
      "normal"
    );
    battleContainer.removeChild(oldContainer);
    battleContainer.addChild(newContainer);
  }
}
