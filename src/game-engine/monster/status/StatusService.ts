import { Service } from "typedi";
import Monster from "../Monster";
import StatusAlteration from "./StatusAlteration";
import StatusContants from "./StatusContants";

@Service()
export default class StatusService {
  /*   
  POISON = "POISON";
  PARALISYS = "PARALISYS";
  BURN = "BURN";
  FREEZE = "FREEZE";
  BADLY_POISONED = "BADLY_POISONED";
  SLEEP = "SLEEP";
  CONFUSION = "CONFUSION";
  HASTE = "HASTE";
  SLOW = "SLOW";
  */

  public isPoisoned(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.POISON);
  }
  public isBadlyPoisoned(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.BADLY_POISONED);
  }
  public isBurned(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.BURN);
  }
  public isConfused(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.CONFUSION);
  }
  public isFreezed(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.FREEZE);
  }
  public isHasted(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.HASTE);
  }
  public isParalyzed(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.PARALISYS);
  }
  public isSleeping(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.SLEEP);
  }
  public isSlowed(monster: Monster): boolean {
    return this.hasStatus(monster, StatusContants.SLOW);
  }

  public getDamage(monster: Monster): number {
    let damage = 0;
    if (this.isBadlyPoisoned(monster)) {
      damage += 0.1 * monster.stats.maxHP;
    }
    if (this.isPoisoned(monster) && !this.isBadlyPoisoned(monster)) {
      damage += 0.05 * monster.stats.maxHP;
    }
    if (this.isBurned(monster)) {
      damage += 0.05 * monster.stats.maxHP;
    }
    return Math.ceil(damage);
  }

  public canWalk(monster: Monster): boolean {
    return this.hasNone(
      monster,
      StatusContants.CONFUSION,
      StatusContants.PARALISYS,
      StatusContants.FREEZE,
      StatusContants.SLEEP
    );
  }

  public canAttack(monster: Monster): boolean {
    return this.hasNone(
      monster,
      StatusContants.CONFUSION,
      StatusContants.PARALISYS,
      StatusContants.FREEZE,
      StatusContants.SLEEP
    );
  }

  protected hasAny(monster: Monster, ...statuses: string[]): boolean {
    for (const status of statuses) {
      if (this.hasStatus(monster, status)) {
        return true;
      }
    }
    return false;
  }
  protected hasNone(monster: Monster, ...statuses: string[]): boolean {
    return !this.hasAny(monster, ...statuses);
  }

  protected hasStatus(monster: Monster, status: string): boolean {
    return this.findByStatus(monster, status).length > 0;
  }

  protected findByStatus(monster: Monster, status: string): StatusAlteration[] {
    return monster.statusAlterations.filter((a) => a.status === status);
  }
}
