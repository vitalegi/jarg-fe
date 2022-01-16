export default class StatusAlteration {
  status;

  public constructor(status: string) {
    this.status = status;
  }

  public static fromJson(json: any): StatusAlteration {
    return new StatusAlteration(json.status);
  }
  public clone(): StatusAlteration {
    return new StatusAlteration(this.status);
  }
}
