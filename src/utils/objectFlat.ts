import { isObject } from "functools-kit";

type Entry = [string, string];

/**
 * Recursively flattens a nested object into an array of key-value pair entries.
 * Converts nested objects and arrays into a linear sequence of `[key, value]` tuples, using empty strings as separators
 * for structural boundaries and skipping functions.
 *
 * @template T - The type of the input object, extending any object type (defaults to `any`).
 *
 * @example
 * // Basic usage with a simple nested object
 * const obj = { name: "John", info: { age: 30, city: "New York" } };
 * console.log(objectFlat(obj));
 * // [
 * //   ["", ""],
 * //   ["name", "John"],
 * //   ["", ""],
 * //   ["info", ""],
 * //   ["", ""],
 * //   ["age", "30"],
 * //   ["city", "New York"],
 * //   ["", ""]
 * // ]
 *
 * @example
 * // Handling arrays and mixed types
 * const mixed = { id: 1, tags: ["a", "b"], meta: { active: true } };
 * console.log(objectFlat(mixed));
 * // [
 * //   ["", ""],
 * //   ["id", "1"],
 * //   ["", ""],
 * //   ["tags", ""],
 * //   ["", ""],
 * //   ["1", "a"],
 * //   ["2", "b"],
 * //   ["", ""],
 * //   ["meta", ""],
 * //   ["", ""],
 * //   ["active", "true"],
 * //   ["", ""]
 * // ]
 *
 * @remarks
 * This function:
 * - Uses `Object.entries` to extract key-value pairs from the input object and processes them recursively.
 * - Ignores properties with function values, skipping them entirely.
 * - For nested objects (detected via `isObject`), inserts a `[key, ""]` entry for the parent key and `["", ""]` separators
 *   before and after the nested content to mark structural boundaries.
 * - For arrays, maps each element to a `[stringified index + 1, value]` pair (e.g., `[0, "a"]` becomes `["1", "a"]`),
 *   with separators before and after.
 * - Converts all non-object, non-array values to strings using `String()`.
 * Useful in the agent swarm system for serializing complex agent state, configuration, or data structures into a flat,
 * iterable format for logging, debugging, or processing.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries|Object.entries}
 * for details on extracting key-value pairs.
 * @see {@link module:functools-kit.isObject} for the object type check implementation.
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
