import LoggerLevel from "./LoggerLevel";

const RULES = [
  { name: "MonsterAI", level: "INFO" },
  { name: ".*", level: "INFO" },
];

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

  protected retrieveLogLevel(name: string): number {
    const level = RULES.filter((rule) => this.matches(name, rule.name))[0]
      .level;
    if (level === "ERROR") {
      return LoggerLevel.ERROR;
    }
    if (level === "TRACE") {
      return LoggerLevel.TRACE;
    }
    if (level === "INFO") {
      return LoggerLevel.INFO;
    }
    if (level === "DEBUG") {
      return LoggerLevel.DEBUG;
    }
    throw Error(`Unknown logger level ${level}`);
  }

  protected matches(name: string, rule: string): boolean {
    return name.match(`^${rule}$`) != null;
  }
}
