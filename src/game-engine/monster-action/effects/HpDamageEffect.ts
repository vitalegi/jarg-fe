import Monster from "@/game-engine/monster/Monster";
import Effect from "./Effect";
import Target from "./target/Target";

export default class HpDamageEffect extends Effect {
  public static KEY = "HP_DAMAGE";
  type = HpDamageEffect.KEY;
  damage = 0;

  public static fromJson(json: any): HpDamageEffect {
    const effect = new HpDamageEffect();
    Effect.fromJson(effect, json);
    effect.damage = json.damage;
    return effect;
  }

  apply(monster: Monster): void {
    const originalValue = monster.stats.hp;
    const newValue = Math.round(originalValue - this.damage);
    monster.stats.hp = newValue;
  }

  textualEffect(monster: Monster): string {
    return `${this.damage} HP`;
  }
}
