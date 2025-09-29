/**
 * Validates that an output string is not empty or whitespace-only.
 * Trims the input and checks if the result is an empty string, returning an error message if so.
 *
 *   - `"Empty output"` if the string is empty or contains only whitespace after trimming.
 *   - `null` if the string has non-whitespace content, indicating it is valid.
 *
 * @example
 * // Basic usage with various inputs
 * console.log(await validateNoEmptyResult("Hello"));    // null (valid)
 * console.log(await validateNoEmptyResult(""));         // "Empty output"
 * console.log(await validateNoEmptyResult("   "));      // "Empty output" (whitespace only)
 * console.log(await validateNoEmptyResult("  Text  ")); // null (valid after trim)
 *
 * @example
 * // Edge cases with falsy or special inputs
 * console.log(await validateNoEmptyResult("\n\t"));     // "Empty output" (only newlines/tabs)
 * console.log(await validateNoEmptyResult("x"));        // null (single character is valid)
 *
 * @remarks
 * This function:
 * - Uses `String.prototype.trim()` to remove leading and trailing whitespace from the input.
 * - Returns `"Empty output"` if the trimmed result is an empty string (`""`), treating whitespace-only strings as invalid.
 * - Returns `null` if the trimmed string has any non-whitespace characters, indicating a valid output.
 * - Operates asynchronously to align with the validation pipeline (e.g., `validateDefault`), though the check itself is synchronous.
 * Useful in the agent swarm system to ensure agent or model outputs contain meaningful content, preventing empty or trivial responses
 * from being processed further (e.g., as part of `ClientAgent.validate`).
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim|String.trim}
 * for details on whitespace trimming.
 * @see {@link ./validateDefault|validateDefault} for its use in the broader validation chain.
 */
export const validateNoEmptyResult = async (output: string): Promise<string | null> => {
  if (!output.trim()) {
    return "Empty output";
  }
  return null;
};

export default validateNoEmptyResult;
