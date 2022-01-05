import { Service } from "typedi";
import MapContainer from "./MapContainer";

@Service()
export default class MapRepository {
  map: MapContainer | null = null;

  public setMap(map: MapContainer): void {
    this.map = map;
  }
  public getMap(): MapContainer {
    if (this.map) {
      return this.map;
    }
    throw Error(`Map is null`);
  }
}
