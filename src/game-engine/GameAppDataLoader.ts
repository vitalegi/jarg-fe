import { AnimationSrc } from "@/models/Animation";
import SpriteConfig from "@/models/SpriteConfig";
import GameAssetService from "@/services/GameAssetService";
import RendererService, { Asset } from "@/services/RendererService";
import ArrayUtil from "@/utils/ArrayUtil";
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
  protected rendererService = Container.get<RendererService>(RendererService);

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

  public async loadMonstersAnimationMetadata(
    monsterIds: string[]
  ): Promise<void> {
    // pre-requisites
    await this.loadMonsters();
    const monsters = this.monsterIndexRepository
      .getMonsters()
      .filter((m) => monsterIds.indexOf(m.monsterId) !== -1);

    await Promise.all(
      monsters.map((m) =>
        this.loadOnce(`monsterData_${m.monsterId}`, () =>
          this._loadMonstersAnimationsMetadata([m])
        )
      )
    );
  }

  public async loadMonstersSpriteSheets(
    monsters: MonsterIndex[]
  ): Promise<void> {
    // pre-requisites
    await this.loadMonstersAnimationMetadata(monsters.map((m) => m.monsterId));

    await Promise.all(
      monsters.map((m) =>
        this.loadOnce(`monsterSpriteSheets_${m.monsterId}`, () =>
          this.loadMonsterSpriteSheets(m)
        )
      )
    );
    await this.rendererService.loadAssets();
  }

  protected async loadMonsterSpriteSheets(
    monster: MonsterIndex
  ): Promise<void> {
    const assets = monster.animationsSrc.map(
      (a) =>
        new Asset(
          `${monster.name}_${a.key}`,
          `${process.env.VUE_APP_BACKEND}${a.sprites}`
        )
    );
    this.rendererService.addImages(assets);
    console.log("Load SpriteSheet done", assets);
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

  public async loadTiles(sprites: SpriteConfig[]): Promise<void> {
    const mapSprites = sprites
      .flatMap((sprite) => sprite.sprites)
      .map((sprite) => {
        return { name: sprite, url: `${process.env.VUE_APP_BACKEND}${sprite}` };
      });
    const images = ArrayUtil.removeDuplicates(
      mapSprites,
      (a, b) => a.name === b.name
    );

    images.forEach((image) =>
      this.loadOnce(`sprites_${image.name}`, () =>
        this.rendererService.addImages([image])
      )
    );
    await this.rendererService.loadAssets();
  }

  protected async _loadMonstersAnimationsMetadata(
    monsters: MonsterIndex[]
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const monster of monsters) {
      for (const animationSrc of monster.animationsSrc) {
        promises.push(
          this._loadMonsterAnimationMetadata(monster, animationSrc)
        );
      }
    }
    await Promise.all(promises);
    console.log(
      `Load monster animations' metadata for ${monsters
        .map((m) => m.monsterId)
        .join(", ")} done.`
    );
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