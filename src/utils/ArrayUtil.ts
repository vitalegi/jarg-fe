export default class ArrayUtil {
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
