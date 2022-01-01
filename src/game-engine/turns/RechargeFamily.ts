export default class RechargeFamily {
  public static validate(family: number): void {
    if (family >= 1 && family <= 8) {
      return;
    }
    throw Error(`Family ${family} is unknown`);
  }
}
