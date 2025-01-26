import { trycatch } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import xml2js from "xml2js";

const toolParser = new xml2js.Parser();

/**
 * Validates that the given output string does not contain any tool call entries or disallowed symbols.
 * @see https://github.com/ollama/ollama/issues/8287
 * 
 * @param {string} output - The output string to validate.
 * @returns {Promise<string | null>} - A promise that resolves to a string indicating a tool call in the text output, or null if no tool call is found.
 * @throws {Error} - If an error occurs during XML parsing.
 */
export const validateNoToolCall: (output: string) => Promise<string | null> = trycatch(
  async (output: string) => {
    for (const symbol of GLOBAL_CONFIG.CC_AGENT_DISALLOWED_SYMBOLS) {
      if (output.includes(symbol)) {
        return "Tool call in text output";
      }
    }
    const result = await toolParser.parseStringPromise(output);
    for (const tag of GLOBAL_CONFIG.CC_AGENT_DISALLOWED_TAGS) {
      if (result[tag]) {
        return "Tool call in text output";
      }
    }
    return null;
  },
  {
    defaultValue: null,
  }
);

export default validateNoToolCall;
