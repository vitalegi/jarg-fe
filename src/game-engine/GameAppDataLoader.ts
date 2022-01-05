import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import MonsterIndexRepository from "./repositories/MonsterIndexRepository";

@Service()
export default class GameAppDataLoader {
  protected _loaded = new Array<string>();

  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );

  public async loadMonsters(): Promise<void> {
    this.loadOnce("monsterIndex", () =>
      this.gameAssetService
        .getMonstersData()
        .then((monsters) => this.monsterIndexRepository.init(monsters))
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
