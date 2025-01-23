import validateNoEmptyResult from "./validateNoEmptyResult";
import validateNoToolCall from "./validateNoToolCall";

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
