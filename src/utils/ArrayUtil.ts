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
  public static getDuplicates<E>(
    array: E[],
    equals: (a: E, b: E) => boolean
  ): E[] {
    const duplicates: E[] = [];
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (equals(array[i], array[j])) {
          duplicates.push(array[i]);
        }
      }
    }
    return ArrayUtil.removeDuplicates(duplicates, equals);
  }
}
