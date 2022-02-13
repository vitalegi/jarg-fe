import ComputedEffectUtil from "@/game-engine/ability/computed-effect/ComputedEffectUtil";
import Monster from "@/game-engine/model/monster/Monster";
import StatusContants from "@/game-engine/monster/status/StatusContants";
import { Service } from "typedi";

@Service()
export default class StatusService {
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

  public getSpeedBonus(monster: Monster): number {
    if (this.isHasted(monster) && this.isSlowed(monster)) {
      return 1;
    }
    if (this.isHasted(monster)) {
      return 2;
    }
    if (this.isSlowed(monster)) {
      return 0.5;
    }
    return 1;
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

  protected findByStatus(monster: Monster, status: string): string[] {
    return ComputedEffectUtil.getStatusAlterations(monster.activeEffects)
      .map((e) => e.status)
      .filter((s) => s === status);
  }
}
