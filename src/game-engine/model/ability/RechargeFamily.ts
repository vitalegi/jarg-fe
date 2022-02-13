import NumberUtil from "@/utils/NumberUtil";

export default class RechargeFamily {
  public static VALUES = [1, 2, 3, 4, 5, 6, 7, 8];
  public static DEFAULT_VALUE = 3;
  protected static MIN = NumberUtil.min(RechargeFamily.VALUES);
  protected static MAX = NumberUtil.max(RechargeFamily.VALUES);

  public static validate(family: number): void {
    if (family >= RechargeFamily.MIN && family <= RechargeFamily.MAX) {
      return;
    }
    throw Error(`Family ${family} is unknown`);
  }
}
