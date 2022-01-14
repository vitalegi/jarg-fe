import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import RandomService from "@/services/RandomService";
import Container, { Service } from "typedi";
import Ability from "../monster-action/ability/Ability";

const DECIMAL_PRECISION = 0.00001;

const TS = [
  { ge: 0, le: 0, ts: 28 },
  { ge: 1, le: 1, ts: 26 },
  { ge: 2, le: 2, ts: 24 },
  { ge: 3, le: 3, ts: 22 },
  { ge: 4, le: 4, ts: 20 },
  { ge: 5, le: 6, ts: 16 },
  { ge: 7, le: 9, ts: 15 },
  { ge: 10, le: 11, ts: 14 },
  { ge: 12, le: 14, ts: 13 },
  { ge: 15, le: 16, ts: 12 },
  { ge: 17, le: 18, ts: 11 },
  { ge: 19, le: 22, ts: 10 },
  { ge: 23, le: 28, ts: 9 },
  { ge: 29, le: 34, ts: 8 },
  { ge: 35, le: 43, ts: 7 },
  { ge: 44, le: 61, ts: 6 },
  { ge: 62, le: 97, ts: 5 },
  { ge: 98, le: 169, ts: 4 },
  { ge: 170, le: 255, ts: 3 },
];

const ICV = [
  { ge: 0, le: 1, icv_min: 83, icv_max: 84 },
  { ge: 2, le: 2, icv_min: 77, icv_max: 78 },
  { ge: 3, le: 3, icv_min: 71, icv_max: 72 },
  { ge: 4, le: 4, icv_min: 59, icv_max: 60 },
  { ge: 5, le: 5, icv_min: 47, icv_max: 48 },
  { ge: 6, le: 6, icv_min: 46, icv_max: 48 },
  { ge: 7, le: 7, icv_min: 44, icv_max: 45 },
  { ge: 8, le: 8, icv_min: 43, icv_max: 45 },
  { ge: 9, le: 9, icv_min: 42, icv_max: 45 },
  { ge: 10, le: 10, icv_min: 41, icv_max: 42 },
  { ge: 11, le: 11, icv_min: 40, icv_max: 42 },
  { ge: 12, le: 12, icv_min: 38, icv_max: 39 },
  { ge: 13, le: 13, icv_min: 37, icv_max: 39 },
  { ge: 14, le: 14, icv_min: 36, icv_max: 39 },
  { ge: 15, le: 15, icv_min: 35, icv_max: 36 },
  { ge: 16, le: 16, icv_min: 34, icv_max: 36 },
  { ge: 17, le: 17, icv_min: 32, icv_max: 33 },
  { ge: 18, le: 18, icv_min: 31, icv_max: 33 },
  { ge: 19, le: 19, icv_min: 29, icv_max: 30 },
  { ge: 20, le: 20, icv_min: 28, icv_max: 30 },
  { ge: 21, le: 21, icv_min: 27, icv_max: 30 },
  { ge: 22, le: 22, icv_min: 26, icv_max: 30 },
  { ge: 23, le: 23, icv_min: 26, icv_max: 27 },
  { ge: 24, le: 24, icv_min: 25, icv_max: 27 },
  { ge: 25, le: 25, icv_min: 24, icv_max: 27 },
  { ge: 26, le: 26, icv_min: 23, icv_max: 27 },
  { ge: 27, le: 27, icv_min: 22, icv_max: 27 },
  { ge: 28, le: 28, icv_min: 21, icv_max: 27 },
  { ge: 29, le: 29, icv_min: 23, icv_max: 24 },
  { ge: 30, le: 30, icv_min: 22, icv_max: 24 },
  { ge: 31, le: 31, icv_min: 21, icv_max: 24 },
  { ge: 32, le: 32, icv_min: 20, icv_max: 24 },
  { ge: 33, le: 33, icv_min: 19, icv_max: 24 },
  { ge: 34, le: 34, icv_min: 18, icv_max: 24 },
  { ge: 35, le: 35, icv_min: 20, icv_max: 21 },
  { ge: 36, le: 36, icv_min: 19, icv_max: 21 },
  { ge: 37, le: 37, icv_min: 18, icv_max: 21 },
  { ge: 38, le: 38, icv_min: 17, icv_max: 21 },
  { ge: 39, le: 39, icv_min: 16, icv_max: 21 },
  { ge: 40, le: 40, icv_min: 15, icv_max: 21 },
  { ge: 41, le: 41, icv_min: 14, icv_max: 21 },
  { ge: 42, le: 42, icv_min: 13, icv_max: 21 },
  { ge: 43, le: 43, icv_min: 12, icv_max: 21 },
  { ge: 44, le: 45, icv_min: 17, icv_max: 18 },
  { ge: 46, le: 47, icv_min: 16, icv_max: 18 },
  { ge: 48, le: 49, icv_min: 15, icv_max: 18 },
  { ge: 50, le: 51, icv_min: 14, icv_max: 18 },
  { ge: 52, le: 53, icv_min: 13, icv_max: 18 },
  { ge: 54, le: 55, icv_min: 12, icv_max: 18 },
  { ge: 56, le: 57, icv_min: 11, icv_max: 18 },
  { ge: 58, le: 59, icv_min: 10, icv_max: 18 },
  { ge: 60, le: 61, icv_min: 9, icv_max: 18 },
  { ge: 62, le: 65, icv_min: 14, icv_max: 15 },
  { ge: 66, le: 69, icv_min: 13, icv_max: 15 },
  { ge: 70, le: 73, icv_min: 12, icv_max: 15 },
  { ge: 74, le: 77, icv_min: 11, icv_max: 15 },
  { ge: 78, le: 81, icv_min: 10, icv_max: 15 },
  { ge: 82, le: 85, icv_min: 9, icv_max: 15 },
  { ge: 86, le: 89, icv_min: 8, icv_max: 15 },
  { ge: 90, le: 93, icv_min: 7, icv_max: 15 },
  { ge: 94, le: 97, icv_min: 6, icv_max: 15 },
  { ge: 98, le: 105, icv_min: 11, icv_max: 12 },
  { ge: 106, le: 113, icv_min: 10, icv_max: 12 },
  { ge: 114, le: 121, icv_min: 9, icv_max: 12 },
  { ge: 122, le: 129, icv_min: 8, icv_max: 12 },
  { ge: 130, le: 137, icv_min: 7, icv_max: 12 },
  { ge: 138, le: 145, icv_min: 6, icv_max: 12 },
  { ge: 146, le: 153, icv_min: 5, icv_max: 12 },
  { ge: 154, le: 161, icv_min: 4, icv_max: 12 },
  { ge: 162, le: 169, icv_min: 3, icv_max: 12 },
  { ge: 170, le: 185, icv_min: 8, icv_max: 9 },
  { ge: 186, le: 201, icv_min: 7, icv_max: 9 },
  { ge: 202, le: 217, icv_min: 6, icv_max: 9 },
  { ge: 218, le: 233, icv_min: 5, icv_max: 9 },
  { ge: 234, le: 249, icv_min: 4, icv_max: 9 },
  { ge: 250, le: 255, icv_min: 3, icv_max: 9 },
];

// TODO move to dedicated file
export enum ActionType {
  MOVE = "MOVE",
  ABILITY = "ABILITY",
}

// TODO move to dedicated file
export class Action {
  type: ActionType;
  source: Point | null = null;
  dest: Point | null = null;
  distance = 0;
  ability: Ability | null = null;

  public constructor(type: ActionType) {
    this.type = type;
  }

  public static move(source: Point, dest: Point, distance: number): Action {
    const t = new Action(ActionType.MOVE);
    t.source = source;
    t.dest = dest;
    t.distance = distance;
    return t;
  }

  public static ability(ability: Ability): Action {
    const t = new Action(ActionType.ABILITY);
    t.ability = ability;
    return t;
  }
}

// TODO move to dedicated file
class Tick {
  monster: Monster;
  ticks = 0;
  actionsHistory: Action[] = [];

  public constructor(monster: Monster, ticks = 0) {
    this.monster = monster;
    this.ticks = ticks;
  }

  public toString(): string {
    return `(uuid=${this.monster.uuid.substring(0, 8)}, name=${
      this.monster.name
    }, ticks=${this.ticks})`;
  }

  public moves(path: Point[]): void {
    this.actionsHistory.push(
      Action.move(path[0], path[path.length - 1], path.length - 1)
    );
  }

  public usesAbility(ability: Ability): void {
    this.actionsHistory.push(Action.ability(ability));
  }
}

@Service()
export default class TurnManager {
  logger = LoggerFactory.getLogger("GameEngine.Battle.TurnManager");

  protected randomService = Container.get<RandomService>(RandomService);

  // TODO retrieve by mapRepository
  protected monsters: Monster[] = [];
  // TODO move to TurnRepository
  protected ticks: Tick[] = [];
  // TODO move to TurnRepository
  protected active: Tick | null = null;

  public addCharacters(monsters: Monster[]): void {
    monsters.forEach((m) => this.addCharacter(m));
  }

  public addCharacter(monster: Monster): void {
    this.monsters.push(monster);
  }

  public removeAll(): void {
    this.monsters = [];
    this.ticks = [];
    this.active = null;
  }

  public removeCharacter(uuid: string): void {
    this.ticks = this.ticks.filter((t) => t.monster.uuid !== uuid);

    const index = this.monsters.findIndex((m) => m.uuid === uuid);
    if (index !== -1) {
      this.monsters.splice(index, 1);
    }
  }

  public initTurns(): void {
    this.monsters
      .map((m) => new Tick(m, this.getICV(m)))
      .forEach((t) => this.ticks.push(t));
    this.next();
    this.logger.info(`init: ${this.ticks.join(", ")}`);
  }
  public hasCharacters(): boolean {
    return this.monsters.length > 0;
  }
  public activeCharacter(): Tick | null {
    if (this.active) {
      return this.active;
    }
    return null;
  }

  public next(): void {
    if (this.active) {
      this.ticks = this.ticks.filter(
        (t) => t.monster.uuid !== this.active?.monster.uuid
      );
      const tick = new Tick(
        this.active.monster,
        this.getTS(this.active.monster)
      );
      this.logger.info(`Re-calculate ticks for exiting monster: ${tick}`);
      this.ticks.push(tick);
      this.active = null;
    }

    if (this.ticks.filter((t) => t.ticks < DECIMAL_PRECISION).length === 0) {
      const min = this.ticks
        .map((m) => m.ticks)
        .reduce((prev: number, curr: number) => Math.min(prev, curr), 100000);

      this.logger.info(`No other ticks = 0, reduce all by ${min} ticks.`);
      this.logger.debug(`Ticks ${this.ticks.join(", ")}`);
      this.ticks.forEach((t) => (t.ticks -= min));
    }

    this.sort(this.ticks);
    this.active = this.ticks[0];
    this.logger.info(`Next: ${this.active}`);
  }

  public getTurns(n: number): string[] {
    const turns: string[] = [];
    if (this.ticks.length === 0) {
      return turns;
    }
    // TODO re-implement
    // ticks contains the time for the next turn for each monster
    // after that turn, it has to be re-computed
    for (let i = 0; i < n; i++) {
      const tick = this.ticks[i % this.ticks.length];
      turns.push(tick.monster.uuid);
    }
    return turns;
  }

  protected getAgi(monster: Monster): number {
    const max = this.monsters
      .map((m) => m.stats.speed)
      .reduce((prev: number, curr: number) => Math.max(prev, curr), 1);

    return Math.round((255 * monster.stats.speed) / max);
  }

  protected getICV(monster: Monster): number {
    const agi = this.getAgi(monster);
    const icv = ICV.filter((v) => v.ge <= agi).filter((v) => agi <= v.le)[0];
    return this.randomService.randomInt(icv.icv_min, icv.icv_max);
  }

  protected getTS(monster: Monster): number {
    const agi = this.getAgi(monster);
    return TS.filter((v) => v.ge <= agi).filter((v) => agi <= v.le)[0].ts;
  }

  protected sort(ticks: Tick[]): void {
    ticks.sort((a, b) => {
      if (a.ticks - b.ticks > DECIMAL_PRECISION) {
        return 1;
      }
      if (b.ticks - a.ticks > DECIMAL_PRECISION) {
        return -1;
      }
      if (a.monster.stats.speed > b.monster.stats.speed) {
        return -1;
      }
      return a.monster.uuid > b.monster.uuid ? 1 : -1;
    });
  }
}
