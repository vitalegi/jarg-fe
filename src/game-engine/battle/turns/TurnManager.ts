import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import RandomService from "@/services/RandomService";
import Container, { Service } from "typedi";
import TS from "@/assets/turn-manager/ts.json";
import ICV from "@/assets/turn-manager/icv.json";
import Tick from "./Tick";
import HistoryRepository from "./HistoryRepository";
import { PerformedAction } from "./PerformedAction";
import TimeUtil from "@/utils/TimeUtil";

const DECIMAL_PRECISION = 0.00001;

// TODO move to dedicated file

@Service()
export default class TurnManager {
  logger = LoggerFactory.getLogger("GameEngine.Battle.TurnManager");

  protected randomService = Container.get<RandomService>(RandomService);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);

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
    if (this.active?.monster.uuid === uuid) {
      this.active = null;
    }
  }

  public initTurns(): void {
    this.monsters
      .map((m) => new Tick(m, this.getICV(m)))
      .forEach((t) => this.ticks.push(t));
    this.next();
    this.logger.debug(`init: ${this.ticks.join(", ")}`);
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
      const actions = this.historyRepository.getCurrent().actionsHistory;
      const monster = this.active.monster;
      const ts = this.getTS(monster, this.getRechargeFamily(actions));
      const tick = new Tick(monster, ts);
      this.logger.debug(`Re-calculate ticks for exiting monster: ${tick}`);
      this.ticks.push(tick);
      this.active = null;
    }

    if (this.ticks.filter((t) => t.ticks < DECIMAL_PRECISION).length === 0) {
      const min = this.ticks
        .map((m) => m.ticks)
        .reduce((prev: number, curr: number) => Math.min(prev, curr), 100000);

      this.logger.debug(
        `No other ticks = 0, reduce all by ${min} ticks. Status: ${this.ticks.join(
          ", "
        )}`
      );
      this.ticks.forEach((t) => (t.ticks -= min));
    }

    this.sort(this.ticks);
    this.active = this.ticks[0];
    this.historyRepository.startTurn(this.active.monster);
    this.logger.info(`Next: ${this.active}`);
  }

  public getTurns(n: number): Tick[] {
    return TimeUtil.monitor(`getTurns ${n}`, () => this.doGetTurns(n), 1);
  }

  protected doGetTurns(n: number): Tick[] {
    const ticks = this.ticks.flatMap((tick) => {
      // for each monster, generate N entries
      const estimations = [];
      // the first entry is already computed
      estimations.push(tick);
      let cumulativeTS = tick.ticks;
      for (let i = 1; i < n; i++) {
        // the remaining entries are assumed to be executed with a normal action
        const nextTurn = this.getTS(tick.monster, 3);
        cumulativeTS += nextTurn;
        estimations.push(new Tick(tick.monster, cumulativeTS));
      }
      return estimations;
    });
    this.sort(ticks);
    if (ticks.length > n) {
      ticks.splice(n);
    }
    return ticks;
  }

  public reportTicksStatus(optional?: Tick[]): void {
    const toString = (arr: Tick[]) =>
      arr.map((t) => t.toShortString()).join(", ");

    this.logger.debug(
      `Upcoming turns: ${toString(
        optional ? optional : []
      )}. Pre-calculated: ${toString(this.ticks)}. Active: ${
        this.active?.monster.name
      }`
    );
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

  protected getRechargeFamily(performedActions: PerformedAction[]): number {
    // TODO
    return 3;
  }

  protected getTS(monster: Monster, rechargeFamily: number): number {
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
