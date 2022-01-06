import { AnimationSrc } from "@/models/Animation";
import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import MonsterIndex from "./monster/MonsterIndex";
import AbilityRepository from "./repositories/AbilityRepository";
import MonsterIndexRepository from "./repositories/MonsterIndexRepository";
import TypeRepository from "./repositories/TypeRepository";

@Service()
export default class GameAppDataLoader {
  protected _loaded = new Array<string>();

  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);
  protected typeRepository = Container.get<TypeRepository>(TypeRepository);

  public async loadMonsters(): Promise<void> {
    // pre-requisites
    await this.loadAbilities();
    await this.loadTypes();

    await this.loadOnce("monstersIndex", () =>
      this.gameAssetService
        .getMonstersData()
        .then((monsters) => this.monsterIndexRepository.init(monsters))
    );
  }

  public async loadMonstersAnimationMetadata(): Promise<void> {
    // pre-requisites
    await this.loadMonsters();

    await this.loadOnce("monstersMetadata", () =>
      this._loadMonstersAnimationsMetadata(
        this.monsterIndexRepository.getMonsters()
      )
    );
  }

  public async loadAbilities(): Promise<void> {
    await this.loadOnce("abilities", () =>
      this.gameAssetService
        .getAbilitiesData()
        .then((a) => this.abilityRepository.init(a))
    );
  }

  public async loadTypes(): Promise<void> {
    await this.loadOnce("abilities", () =>
      this.gameAssetService
        .getTypeBonuses()
        .then((types) => this.typeRepository.init(types))
    );
  }

  protected async _loadMonstersAnimationsMetadata(
    monsters: MonsterIndex[]
  ): Promise<void> {
    console.log("Load animations' metadata");

    const promises: Promise<void>[] = [];
    for (const monster of monsters) {
      for (const animationSrc of monster.animationsSrc) {
        promises.push(
          this._loadMonsterAnimationMetadata(monster, animationSrc)
        );
      }
    }
    await Promise.all(promises);
    console.log("Load animations' metadata done.");
  }

  protected async _loadMonsterAnimationMetadata(
    monster: MonsterIndex,
    animationSrc: AnimationSrc
  ): Promise<void> {
    const animation = await this.gameAssetService.getAnimationMetadata(
      animationSrc.key,
      animationSrc.metadata
    );
    monster.animations.push(animation);
    console.log(
      `Loaded animation metadata for ${monster.name}, ${animationSrc.key}`
    );
  }

  protected async loadOnce(
    key: string,
    load: () => Promise<void>
  ): Promise<void> {
    if (this.loaded(key)) {
      return;
    }
    this._loaded.push(key);
    await load();
  }

  protected loaded(key: string): boolean {
    return this._loaded.filter((v) => v === key).length > 0;
  }
}
