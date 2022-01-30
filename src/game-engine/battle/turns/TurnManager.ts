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
import ActionType from "./ActionType";
import Ability from "@/game-engine/monster-action/ability/Ability";

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

  public addCharacters(monsters: Monster[]): void {
    monsters.forEach((m) => this.addCharacter(m));
  }

  public addCharacter(monster: Monster): void {
    this.monsters.push(monster);
  }

  public removeAll(): void {
    this.monsters = [];
    this.ticks = [];
  }

  public removeCharacter(uuid: string): void {
    this.ticks = this.ticks.filter((t) => t.monster.uuid !== uuid);

    const index = this.monsters.findIndex((m) => m.uuid === uuid);
    if (index !== -1) {
      this.monsters.splice(index, 1);
    }
    if (this.activeCharacter()?.monster.uuid === uuid) {
      this.ticks = this.updateTurns(this.ticks);
    }
  }

  public initTurns(): void {
    this.monsters
      .map((m) => new Tick(m, this.getICV(m)))
      .forEach((t) => this.ticks.push(t));
    this.ticks = this.updateTurns(this.ticks);
    const next = this.ticks[0];
    this.historyRepository.startTurn(next.monster);

    this.logger.debug(
      `init: ${this.ticks.join(", ")}. Active: ${this.activeCharacter()}`
    );
  }
  public hasCharacters(): boolean {
    return this.monsters.length > 0;
  }
  public activeCharacter(): Tick | null {
    if (this.ticks.length > 0) {
      return this.ticks[0];
    }
    return null;
  }

  public next(): void {
    const active = this.activeCharacter();
    if (active) {
      const actions = this.historyRepository.getCurrent().actionsHistory;
      const recharge = this.getRechargeFamily(actions);
      this.ticks = this.createNextTick(this.ticks, active, recharge);
      this.logger.debug(
        `Compute ticks for exiting monster: ${active.monster.uuid} ${active.monster.name}`
      );
    }
    this.ticks = this.updateTurns(this.ticks);
    const next = this.ticks[0];
    this.historyRepository.startTurn(next.monster);
    this.logger.info(`Next: ${next}`);
  }

  protected createNextTick(
    ticks: Tick[],
    tick: Tick,
    rechargeFamily: number
  ): Tick[] {
    ticks = ticks.map((t) => t.clone());
    const target = ticks.findIndex((t) => t.monster.uuid === tick.monster.uuid);
    const ts = this.getTS(tick.monster, rechargeFamily);
    ticks[target] = new Tick(tick.monster, ts);
    return ticks;
  }

  protected updateTurns(ticks: Tick[]): Tick[] {
    if (ticks.filter((t) => t.ticks < DECIMAL_PRECISION).length === 0) {
      const min = ticks
        .map((m) => m.ticks)
        .reduce((prev: number, curr: number) => Math.min(prev, curr), 100000);

      this.logger.debug(
        `No other ticks = 0, reduce all by ${min} ticks. Status: ${ticks.join(
          ", "
        )}`
      );
      ticks.forEach((t) => (t.ticks -= min));
    }

    this.sort(ticks);
    return ticks;
  }

  public getTurns(n: number): Tick[] {
    return TimeUtil.monitor(`getTurns ${n}`, () => this.doGetTurns(n), 0.1);
  }

  protected doGetTurns(n: number): Tick[] {
    this.logger.debug(`doGetTurns (${n})`);
    if (this.ticks.length === 0) {
      return [];
    }
    const out: Tick[] = [];
    let ticks = this.ticks;
    let active = this.activeCharacter();
    this.logger.debug(`Add active: ${active}`);
    if (active) {
      out.push(active);
      const actions = this.historyRepository.getCurrent().actionsHistory;
      const recharge = this.getRechargeFamily(actions);
      ticks = this.createNextTick(ticks, active, recharge);
    }
    for (let i = 1; i < n; i++) {
      ticks = this.updateTurns(ticks);
      active = ticks[0];
      if (this.logger.isDebugEnabled()) {
        this.logger.debug(
          `Estimate active at turn ${i}: ${active}, status ${ticks.map(
            (t) => t.monster.name + " " + t.ticks
          )}`
        );
      }
      out.push(active);
      ticks = this.createNextTick(ticks, active, 3);
    }
    return out;
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
    const abilities = performedActions
      .filter((p) => p.type === ActionType.ABILITY)
      .map((p) => p.ability)
      .filter((a) => a !== null)
      .map((a) => a as Ability);

    if (abilities.length === 0) {
      return 3;
    }
    return abilities[abilities.length - 1].rechargeFamily;
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
