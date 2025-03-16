import validateNoEmptyResult from "./validateNoEmptyResult";
import validateNoToolCall from "./validateNoToolCall";

/**
 * Validates an output string using a sequence of predefined validation functions.
 * Checks the string against multiple criteria (e.g., non-empty, no tool calls) and returns the first validation error encountered.
 *
 * @param {string} output - The output string to validate, typically from an agent or model response.
 * @returns {Promise<string | null>} A promise that resolves to:
 *   - A string error message if any validation fails (e.g., "Output is empty" or "Contains tool call").
 *   - `null` if all validations pass, indicating the output is valid.
 * @throws {Error} Propagates any errors thrown by the underlying validation functions (`validateNoEmptyResult`, `validateNoToolCall`).
 *
 * @example
 * // Basic usage with valid and invalid outputs
 * console.log(await validateDefault("Hello, world!")); // null (valid)
 * console.log(await validateDefault(""));              // "Output is empty" (assuming validateNoEmptyResult behavior)
 * console.log(await validateDefault("<tool_call>"));   // "Contains tool call" (assuming validateNoToolCall behavior)
 *
 * @example
 * // Chained validation with multiple checks
 * const output = "  "; // Only whitespace
 * const result = await validateDefault(output);
 * console.log(result); // "Output is empty" (assuming validateNoEmptyResult trims and checks)
 *
 * @remarks
 * This function:
 * - Sequentially applies validation functions (`validateNoEmptyResult`, `validateNoToolCall`) to the input `output`.
 * - Returns the first non-null result from a validation function, short-circuiting further checks.
 * - Relies on imported validators:
 *   - `validateNoEmptyResult`: Likely checks for empty or whitespace-only strings.
 *   - `validateNoToolCall`: Likely detects XML-like tool call tags (e.g., `<tool_call>`).
 * - Returns `null` only if all validators pass, indicating a fully valid output.
 * Useful in the agent swarm system as a default validation step for agent outputs, ensuring they meet basic quality criteria
 * before further processing or emission (e.g., in `ClientAgent.validate`).
 *
 * @see {@link ./validateNoEmptyResult} for the empty result validation logic.
 * @see {@link ./validateNoToolCall} for the tool call detection logic.
 */
export const validateDefault = async (output: string): Promise<string | null> => {
  let validation: string | null = null;
  if ((validation = await validateNoEmptyResult(output))) {
    return validation;
  }
  if ((validation = await validateNoToolCall(output))) {
    return validation;
  }
  return null;
};

export default validateDefault;
