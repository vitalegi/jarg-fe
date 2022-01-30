export default class CookieUtil {
  public static getValue(key: string): string {
    const pair = document.cookie
      .split(";")
      .map((p) => CookieUtil.getPair(p))
      .filter((p) => p.key === key);
    if (pair.length === 0) {
      return "";
    }
    return pair[0].value;
  }

  protected static getPair(text: string): { key: string; value: string } {
    const separator = text.indexOf("=");
    return {
      key: text.substring(0, separator).trim(),
      value: text.substring(separator + 1),
    };
  }
}
