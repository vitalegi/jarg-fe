import Point from "@/models/Point";
import SpriteConfig from "@/models/SpriteConfig";
import ArrayUtil from "@/utils/ArrayUtil";
import NumberUtil from "@/utils/NumberUtil";
import LocalizedEncounters from "./LocalizedEncounters";
import RandomEncounter from "./RandomEncounter";
import Tile from "./Tile";

export default class MapModel {
  id = "";
  name = "";
  tiles: Tile[] = [];
  randomEncounters: LocalizedEncounters[] = [];
  playerEntryPoints: Point[] = [];

  public static fromJson(json: any): MapModel {
    const out = new MapModel();
    out.id = json.id;
    out.name = json.name;
    if (json.tiles) {
      out.tiles = json.tiles.map(Tile.fromJson);
    }
    if (json.randomEncounters) {
      out.randomEncounters = json.randomEncounters.map(
        LocalizedEncounters.fromJson
      );
    }
    if (json.playerEntryPoints) {
      out.playerEntryPoints = json.playerEntryPoints.map(Point.fromJson);
    }
    return out;
  }

  public validate(): void {
    if (this.id.trim() === "") {
      throw Error(`ID not set`);
    }
    if (this.name.trim() === "") {
      throw Error(`Name not set`);
    }
    this.validateTiles();
    this.randomEncounters.forEach((r) => this.validateRandomEncounter(r));
  }

  protected validateTiles(): void {
    const duplicates = ArrayUtil.getDuplicates(
      this.tiles.map((t) => t.coordinates),
      (a, b) => a === b
    );
    if (duplicates.length > 0) {
      throw Error(
        `Duplicated tile: ${duplicates.map((d) => d.toString()).join(", ")}`
      );
    }
    // TODO move to dedicated class
    /*for (const tile of this.tiles) {
      if (!this.sprites.find((s) => s.name === tile.spriteModel)) {
        throw Error(
          `Missing model for sprite ${tile.coordinates.toString()}: ${
            tile.spriteModel
          }`
        );
      }
    }
    */
  }
  public validateRandomEncounter(randomEncounter: LocalizedEncounters): void {
    randomEncounter.area.forEach((point) => {
      if (!this.hasBaseTile(point)) {
        throw Error(`Point ${point.toString()} is out of the map`);
      }
    });
    if (randomEncounter.minMonsters <= 0) {
      throw Error(`Min monsters must be greater than 0`);
    }
    if (randomEncounter.maxMonsters < randomEncounter.minMonsters) {
      throw Error(`Max monsters must be greater than or equal to Min monsters`);
    }
    randomEncounter.encounters.forEach((e) => this.validateMonster(e));
    const sum = NumberUtil.sum(
      randomEncounter.encounters.map((e) => e.probability)
    );
    if (sum < 0.99999 || sum > 1.00001) {
      throw Error(`Total probability must be 1`);
    }
  }

  protected validateMonster(encounter: RandomEncounter): void {
    if (encounter.levelMin <= 0) {
      throw Error(`Level Min of monster must be greater than 0`);
    }
    if (encounter.levelMax < encounter.levelMin) {
      throw Error(
        `Level Max of monster must be greater than or equal to level min ${encounter.levelMin}`
      );
    }
    if (encounter.monsterId.trim() === "") {
      throw Error(`Monster must be specified`);
    }
    if (encounter.probability <= 0 || encounter.probability > 1) {
      throw Error(`Encounter probability must be in range (0, 1]`);
    }
  }

  protected hasBaseTile(point: Point): boolean {
    return this.tiles.filter((t) => t.coordinates.equals(point)).length > 0;
  }
}
