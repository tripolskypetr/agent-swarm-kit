import validateNoEmptyResult from "./validateNoEmptyResult";
import validateNoToolCall from "./validateNoToolCall";

/**
 * Validates the given output string using a series of validation functions.
 * 
 * @param {string} output - The output string to validate.
 * @returns {Promise<string | null>} - A promise that resolves to a validation error message if any validation fails, or null if all validations pass.
 */
export const validateDefault = async (output: string): Promise<string | null> => {
  let validation: string | null = null;
  if (validation = await validateNoEmptyResult(output)) {
    return validation;
  }
  if (validation = await validateNoToolCall(output)) {
    return validation;
  }
  return null;
};

export default validateDefault;
