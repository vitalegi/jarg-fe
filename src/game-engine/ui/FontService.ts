import { LINE_JOIN, TextStyle } from "pixi.js";
import { Service } from "typedi";

@Service()
export default class FontService {
  public leftMenuEnabled(): Partial<TextStyle> {
    const font = this.baseFont();
    font.fontSize = 20;
    return font;
  }

  public leftMenuDisabled(): Partial<TextStyle> {
    const font = this.leftMenuEnabled();
    font.stroke = "#999999";
    return font;
  }

  public abilityName(): Partial<TextStyle> {
    const font = this.baseFont();
    font.fontSize = 32;
    return font;
  }

  public monsterInfo(): Partial<TextStyle> {
    const font = this.baseFont();
    font.fontSize = 20;
    return font;
  }

  public textOverCharacter(): Partial<TextStyle> {
    const font = this.baseFont();
    font.fontSize = 16;
    return font;
  }

  public turnBox(): Partial<TextStyle> {
    const font = this.baseFont();
    font.fontSize = 14;
    return font;
  }

  protected baseFont(): Partial<TextStyle> {
    return {
      fontFamily: "Courier",
      fill: "#ffffff",
      stroke: "#4a1850",
      strokeThickness: 4,
      lineJoin: LINE_JOIN.ROUND,
    };
  }
}
