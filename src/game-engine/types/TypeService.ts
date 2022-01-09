import Container, { Service } from "typedi";
import TypeRepository from "../repositories/TypeRepository";
import TypeConstants from "./TypeConstants";

@Service()
export default class TypeService {
  protected repo = Container.get<TypeRepository>(TypeRepository);

  public getBonus(source: string, target: string): number {
    return this.repo.getBonus(source, target);
  }

  public getTypes(): string[] {
    return TypeConstants.getTypes();
  }
}
