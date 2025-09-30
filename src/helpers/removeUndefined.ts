
/**
 * Removes properties with `undefined` values from an object.
 *
 * This function iterates over the entries of the given object and excludes
 * any properties whose values are `undefined`. The resulting object retains
 * all other properties and their values.
 *
 *
 * @param obj The obj parameter.
 * @template T - The type of the input object.
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
