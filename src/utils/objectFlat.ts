import { isObject } from "functools-kit";

type Entry = [string, string];

/**
 * Function that recursively flattens a nested object to array of entries.
 */
export const objectFlat = <T extends object = any>(data: T) => {
  const result: Entry[] = [];
  const process = (entries: any[] = []) =>
    entries.forEach(([key, value]) => {
      if (typeof value === "function") {
        return;
      }
      if (isObject(value)) {
        result.push(["", ""]);
        result.push([key, ""]);
        process(Object.entries(value));
        result.push(["", ""]);
        return;
      }
      if (Array.isArray(value)) {
        result.push(["", ""]);
        result.push([key, ""]);
        process(value.map((value, idx) => [String(idx + 1), value]));
        result.push(["", ""]);
        return;
      }
      result.push([key, String(value)]);
    });
  process(Object.entries(data));
  return result;
};

export default objectFlat;
