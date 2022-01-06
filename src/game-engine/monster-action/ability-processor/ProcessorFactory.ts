import AbstractProcessor from "./AbstractProcessor";
import DefaultProcessor from "./DefaultProcessor";

export default class ProcessorFactory {
  public static fromJson(json: any): AbstractProcessor {
    if (json.name === DefaultProcessor.NAME) {
      return DefaultProcessor.fromJson(json);
    }
    throw Error(`Unknown processor ${JSON.stringify(json)}`);
  }
}
