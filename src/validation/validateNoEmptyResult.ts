export const validateNoEmptyResult = async (output: string): Promise<string | null> => {
  if (!output.trim()) {
    return "Empty output";
  }
  return null;
};

export default validateNoEmptyResult;
