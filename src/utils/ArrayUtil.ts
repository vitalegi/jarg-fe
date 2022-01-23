export default class ArrayUtil {
  public static randomize<E>(array: E[]): void {
    const newArray: E[] = [];
    while (array.length > 0) {
      const index = Math.floor(Math.random() * array.length);
      newArray.push(...array.splice(index, 1));
    }
    array.push(...newArray);
  }
  public static removeDuplicates<E>(
    array: E[],
    equals: (a: E, b: E) => boolean
  ): E[] {
    const unique: E[] = [];
    array.forEach((a) => {
      if (!unique.find((u) => equals(a, u))) {
        unique.push(a);
      }
    });
    return unique;
  }
}
