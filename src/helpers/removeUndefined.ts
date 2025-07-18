
/**
 * Removes properties with `undefined` values from an object.
 *
 * This function iterates over the entries of the given object and excludes
 * any properties whose values are `undefined`. The resulting object retains
 * all other properties and their values.
 *
 * @template T - The type of the input object.
 * @param {T} obj - The object to process and remove `undefined` values from.
 * @returns {T} A new object with all `undefined` values removed.
 */
export function removeUndefined<T extends object = any>(obj: T): T {
  const result = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });

  return result as T;
}

export default removeUndefined;
