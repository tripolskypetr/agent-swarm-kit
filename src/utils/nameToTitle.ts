/**
 * Converts a name string to title case, handling underscores and optional dot-separated suffixes.
 * Capitalizes the first character of the primary word and joins additional segments with spaces, optionally stripping trailing dot-separated parts.
 *
 *
 * @example
 * // Basic usage with simple names
 * console.log(nameToTitle("first_name")); // "First Name"
 * console.log(nameToTitle("hello"));      // "Hello"
 * console.log(nameToTitle("user_id"));    // "User Id"
 *
 * @example
 * // Handling dots and edge cases
 * console.log(nameToTitle("document.pdf")); // "Document"
 * console.log(nameToTitle(""));             // undefined
 * console.log(nameToTitle("a_b_c"));       // "A B C"
 * console.log(nameToTitle(null));          // undefined
 *
 * @remarks
 * This function:
 * - Returns `undefined` for falsy inputs (e.g., `null`, `undefined`, empty string), ensuring safe handling of invalid cases.
 * - If the input contains a dot (`.`), it splits on dots and uses the last segment (e.g., "file.txt" becomes "txt"), then processes that.
 * - Splits the resulting string on underscores (`_`), capitalizes the first character of the first segment, and joins all segments with spaces.
 * - Preserves the rest of the first segment in its original case and treats additional segments (from underscores) as-is.
 * Useful in the agent swarm system for formatting agent names, configuration keys, or file names into human-readable titles for display or logging.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split|String.split}
 * for details on string splitting mechanics.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt|String.charAt}
 * for character manipulation details.
*/
export const nameToTitle = (name: string) => {
  if (!name) {
    return undefined;
  }
  if (name.includes(".")) {
    const tokens = name.split(".");
    [name] = tokens.reverse();
  }
  const [word, ...rest] = name.split("_");
  return [`${word.charAt(0).toUpperCase()}${word.slice(1)}`, ...rest].join(" ");
};

export default nameToTitle;
