class Size {
  width = 0;
  height = 0;

  public static fromJson(json: any): Size {
    const out = new Size();
    out.width = json.width;
    out.height = json.height;
    return out;
  }
}

class Frame {
  file = "";
  duration = 0;

  public static fromJson(json: any): Frame {
    const out = new Frame();
    out.file = json.file;
    out.duration = json.duration;
    return out;
  }
}

export class AnimationSrc {
  key = "";
  metadata = "";
  sprites = "";

  public static fromJson(json: any): AnimationSrc {
    const out = new AnimationSrc();
    out.key = json.key;
    out.metadata = json.metadata;
    out.sprites = json.sprites;
    return out;
  }
}

export class Animation {
  key = "";
  name = "";
  data = new Size();
  frames: Frame[] = [];

  public static fromJson(key: string, json: any): Animation {
    const out = new Animation();
    out.key = key;
    out.name = json.name;
    out.data = Size.fromJson(json.data);
    if (json.frames) {
      out.frames = json.frames.map((frame: any) => Frame.fromJson(frame));
    }
    return out;
  }
}
