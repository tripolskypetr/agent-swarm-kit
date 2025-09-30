/**
 * Checks if a given value is a plain JavaScript object.
 * Returns `true` only for objects that inherit directly from `Object.prototype`, excluding arrays, null, and other non-object types.
 *
 *
 * @example
 * // Basic usage with various types
 * console.log(isObject({}));              // true
 * console.log(isObject({ key: "value" })); // true
 * console.log(isObject([]));              // false (arrays are objects but not plain objects)
 * console.log(isObject(null));            // false
 * console.log(isObject("string"));        // false
 * console.log(isObject(42));              // false
 *
 * @example
 * // Testing with custom objects and prototypes
 * const customObj = Object.create(null);
 * console.log(isObject(customObj));       // false (does not inherit from Object.prototype)
 * const plainObj = Object.create(Object.prototype);
 * console.log(isObject(plainObj));        // true
 *
 * @remarks
 * This function performs a strict check for plain objects by verifying:
 * 1. The value’s type is `"object"` (via `typeof`), excluding primitives.
 * 2. The value is not `null`.
 * 3. The value’s prototype is exactly `Object.prototype`, distinguishing plain objects from arrays, functions,
 *    or objects with custom prototypes (e.g., instances of classes or `Object.create(null)`).
 * This is useful in scenarios requiring type safety, such as validating configuration objects or JSON-parsed data
 * in the agent swarm system, where distinguishing between plain objects and other object-like types is critical.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf|Object.getPrototypeOf}
 * for details on prototype checking.
*/
export const isObject = (obj: any): boolean => {
  if (typeof obj === "object" && obj !== null) {
    return Object.getPrototypeOf(obj) === Object.prototype;
  } else {
    return false;
  }
};

export default isObject;
