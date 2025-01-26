/**
 * Validates that the given output string is not empty.
 * 
 * @param {string} output - The output string to validate.
 * @returns {Promise<string | null>} - Returns a promise that resolves to "Empty output" if the string is empty, otherwise null.
 */
export const validateNoEmptyResult = async (output: string): Promise<string | null> => {
  if (!output.trim()) {
    return "Empty output";
  }
  return null;
};

export default validateNoEmptyResult;
