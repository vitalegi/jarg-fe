import NumberUtil from "@/utils/NumberUtil";
import ObjectUtil from "@/utils/ObjectUtil";

export const asIntNullable = (value: any): number | null => {
  if (ObjectUtil.isNullOrUndefined(value)) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return NumberUtil.parseAsInt(value);
  }
  throw Error(`Value is not a number ${value}: ${typeof value}`);
};

/**
 *
 * @param value the object to be parsed
 * @param defaultValue a number if value is optional, false if mandatory
 * @returns
 */
export const asInt = (
  value: any,
  defaultValue: number | false = false
): number => {
  const v = asIntNullable(value);
  if (v === null) {
    if (defaultValue === false) {
      throw Error(`Value is mandatory`);
    }
    return defaultValue;
  }
  return v;
};

/**
 *
 * @param value the object to be parsed
 * @param defaultValue a number if value is optional, false if mandatory
 * @returns
 */
export const asDecimal = (
  value: any,
  defaultValue: number | false = false
): number => {
  if (ObjectUtil.isNullOrUndefined(value)) {
    if (defaultValue === false) {
      throw Error(`Value is mandatory`);
    }
    return defaultValue;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return NumberUtil.parseAsDecimal(value);
  }
  throw Error(`Value is not a number ${value}: ${typeof value}`);
};

/**
 *
 * @param value the object to be parsed
 * @param defaultValue a string if value is optional, false if mandatory
 * @returns
 */
export const asString = (
  value: any,
  defaultValue: string | false = false
): string => {
  if (ObjectUtil.isNullOrUndefined(value)) {
    if (defaultValue === false) {
      throw Error(`Value is mandatory`);
    }
    return defaultValue;
  }
  if (typeof value === "string") {
    return value;
  }
  throw Error(`Value is not a string ${value}: ${typeof value}`);
};

export const asBoolean = (value: any, defaultValue: boolean): boolean => {
  if (ObjectUtil.isNullOrUndefined(value)) {
    return defaultValue;
  }
  if (typeof value === "boolean") {
    return value;
  }
  throw Error(`Value is not a boolean ${value}: ${typeof value}`);
};
