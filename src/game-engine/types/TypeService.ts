import Container, { Service } from "typedi";
import TypeRepository from "../repositories/TypeRepository";

@Service()
export default class TypeService {
  protected repo = Container.get<TypeRepository>(TypeRepository);

  public getBonus(attacker: string, target: string): number {
    return this.repo.getBonus(attacker, target);
  }

  public getTypes(): string[] {
    return this.repo.getTypes();
  }
}
