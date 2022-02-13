import { asString } from "@/utils/JsonUtil";

export default class MapIndex {
  id;
  name;
  url;
  prerequisites;

  public constructor(
    id = "",
    name = "",
    url = "",
    prerequisites: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.prerequisites = prerequisites;
  }

  public static fromJson(json: any): MapIndex {
    const out = new MapIndex();
    out.id = asString(json.id);
    out.name = asString(json.name);
    out.url = asString(json.url);
    if (json.prerequisites) {
      out.prerequisites = json.prerequisites.map(asString);
    }
    return out;
  }

  public clone(): MapIndex {
    const out = new MapIndex();
    out.id = this.id;
    out.name = this.name;
    out.url = this.url;
    if (this.prerequisites) {
      out.prerequisites = this.prerequisites.map((p) => p);
    }
    return out;
  }
}
