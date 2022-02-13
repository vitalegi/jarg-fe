import TypeRepository from "@/game-engine/repositories/TypeRepository";
import TypeConstants from "@/game-engine/type/TypeConstants";
import Container, { Service } from "typedi";

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
