import Container, { Service } from "typedi";
import en from "@/assets/localization-en.json";
import it from "@/assets/localization-it.json";

@Service()
export default class LocalizationService {
  public getStatus(status: string): string {
    return this.getLocalization().statuses[status];
  }

  public getType(type: string): string {
    return this.getLocalization().types[type];
  }

  public getGameLabel(id: string): string {
    return this.getLocalization().gameLabels[id];
  }

  protected getLocalization(): any {
    return it;
  }
}

export class LocalizationUtil {
  public static getStatus(status: string): string {
    return LocalizationUtil.getLocalizationService().getStatus(status);
  }
  public static getType(type: string): string {
    return LocalizationUtil.getLocalizationService().getType(type);
  }
  protected static getLocalizationService(): LocalizationService {
    return Container.get(LocalizationService);
  }
}

const getLocalizationService = (): LocalizationService => {
  return Container.get(LocalizationService);
};

export const gameLabel = (id: string): string => {
  return getLocalizationService().getGameLabel(id);
};
