import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import SpriteConfig from "@/models/SpriteConfig";
import RandomService from "@/services/RandomService";
import NumberUtil from "@/utils/NumberUtil";
import Container, { Service } from "typedi";
import CONFIG from "@/assets/tower-mode.json";
import TileRepository from "@/game-engine/repositories/TileRepository";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import MapModel from "@/game-engine/model/map/MapModel";
import Tile from "@/game-engine/model/map/Tile";
import LocalizedEncounters from "@/game-engine/model/map/LocalizedEncounters";
import RandomEncounter from "@/game-engine/model/map/RandomEncounter";

interface MapConfig {
  preconditions: {
    level_ge: number;
    level_le: number;
  };
  theme: string[];
  candidates: {
    common: string[];
    rare: string[];
    unique: string[];
  };
}

@Service()
export default class TowerMapService {
  logger = LoggerFactory.getLogger("GameEngine.Map.TowerMapService");

  private tileRepository = Container.get<TileRepository>(TileRepository);
  private randomService = Container.get<RandomService>(RandomService);
  private gameAppDataLoader =
    Container.get<GameAppDataLoader>(GameAppDataLoader);

  public async create(level: number): Promise<MapModel> {
    await this.gameAppDataLoader.loadSpriteConfigs();
    const model = new MapModel();
    model.tiles = this.createTiles(level);
    model.playerEntryPoints = this.createPlayerEntrypoints(model.tiles);
    model.randomEncounters = this.createEnemies(
      level,
      model.tiles,
      model.playerEntryPoints
    );
    this.logger.debug(
      `Selected monsters: ${model.randomEncounters
        .flatMap((e) => e.encounters.map((ee) => ee.monsterId))
        .join(", ")}`
    );
    return model;
  }

  protected createTiles(level: number): Tile[] {
    const tiles: Tile[] = [];
    const w = 10;
    const h = 10;
    const configs = this.tileRepository.getAllTiles();
    const walkable = configs
      .filter((c) => c.walkable)
      .filter((p) => this.getConfig(level).theme.includes(p.name));

    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const model = this.randomService.randomElement(walkable);
        const tile = new Tile();
        tile.coordinates = new Point(col, row);
        tile.spriteModel = model.name;
        tiles.push(tile);
      }
    }
    return tiles;
  }

  protected createPlayerEntrypoints(tiles: Tile[]): Point[] {
    const points: Point[] = [];
    const x = Math.floor(this.width(tiles) / 2);
    const y = Math.floor(this.height(tiles) / 2);
    for (let row = 0; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        points.push(new Point(x + col, y + row));
      }
    }
    return points;
  }

  protected createEnemies(
    level: number,
    tiles: Tile[],
    playerSpawn: Point[]
  ): LocalizedEncounters[] {
    const totalEnemies = this.randomService.randomInt(2, 6);
    const encounters: LocalizedEncounters[] = [];
    for (let i = 0; i < totalEnemies; i++) {
      const boss = level % 10 === 0 && i === 0;

      const encounter = new LocalizedEncounters();
      encounter.area = tiles
        .filter((t) => this.findModel(t)?.walkable)
        .map((t) => t.coordinates)
        .filter((p) => playerSpawn.findIndex((ps) => ps.equals(p)) === -1);

      encounter.maxMonsters = 1;
      encounter.minMonsters = 1;
      const monster = new RandomEncounter();
      monster.monsterId = this.getRandomEnemy(level);
      monster.probability = 1;
      if (boss) {
        monster.levelMin = this.getMonsterLevelMax(level);
      } else {
        monster.levelMin = this.getMonsterLevelMin(level);
      }
      monster.levelMax = this.getMonsterLevelMax(level);
      encounter.encounters.push(monster);
      encounters.push(encounter);
    }
    return encounters;
  }

  protected findTile(tiles: Tile[], row: number, col: number): Tile | null {
    const point = new Point(col, row);
    const found = tiles.filter((t) => t.coordinates === point);
    if (found.length > 0) {
      return found[0];
    }
    return null;
  }

  protected findModel(tile: Tile | null): SpriteConfig | null {
    if (tile) {
      return this.tileRepository.getTile(tile.spriteModel);
    }
    return null;
  }

  protected width(tiles: Tile[]): number {
    return 1 + NumberUtil.max(tiles.map((t) => t.coordinates.x));
  }
  protected height(tiles: Tile[]): number {
    return 1 + NumberUtil.max(tiles.map((t) => t.coordinates.y));
  }

  protected getRandomEnemy(level: number): string {
    const cfg = this.getConfig(level);
    let monsters: string[] = [];
    const random = this.randomService.randomDecimal(0, 1);
    if (random < 0.9) {
      monsters = cfg.candidates.common;
    } else if (random < 0.99) {
      monsters = cfg.candidates.rare;
    } else {
      monsters = cfg.candidates.unique;
    }
    if (monsters.length === 0) {
      throw Error(
        `Wrong configuration, no monsters available. Level: ${level}, conf: common=${cfg.candidates.common}, rare=${cfg.candidates.rare}, unique=${cfg.candidates.unique}`
      );
    }
    const pick = this.randomService.randomElement(monsters);
    this.logger.debug(`Pick one in ${monsters.join(", ")}: ${pick}`);
    return pick;
  }

  protected getMonsterLevelMin(level: number): number {
    return Math.floor(3 + level * 1.1);
  }
  protected getMonsterLevelMax(level: number): number {
    if (level < 5) {
      return this.getMonsterLevelMin(level) + 2;
    }
    return this.getMonsterLevelMin(level) + 5;
  }

  protected getConfig(level: number): MapConfig {
    // TODO move CONFIG to assets
    const cfg = CONFIG.filter(
      (c) =>
        c.preconditions.level_ge <= level && level <= c.preconditions.level_le
    );
    if (cfg.length === 0) {
      throw Error(`No configuration available for level ${level}`);
    }
    return cfg[0];
  }
}
