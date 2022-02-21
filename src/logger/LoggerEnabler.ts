import RULES from "@/assets/logger.json";
import LoggerLevel from "@/logger/LoggerLevel";

export default class LoggerEnabler {
  protected cache = new Map<string, number>();

  public isEnabled(logLevel: number, name: string): boolean {
    const cached = this.cache.get(name);
    if (cached) {
      return cached <= logLevel;
    }
    const value = this.retrieveLogLevel(name);
    this.cache.set(name, value);
    return value <= logLevel;
  }

  public isAppenderEnabled(appenderLevel: number, logLevel: number): boolean {
    return appenderLevel <= logLevel;
  }

  protected retrieveLogLevel(name: string): number {
    const level = RULES.loggers.filter((rule) =>
      this.matches(name, rule.name)
    )[0].level;
    return LoggerLevel.getLogLevel(level);
  }

  protected matches(name: string, rule: string): boolean {
    return name.match(`^${rule}$`) != null;
  }
}
