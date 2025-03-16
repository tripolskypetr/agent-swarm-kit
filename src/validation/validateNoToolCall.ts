import { trycatch } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import xml2js from "xml2js";

const toolParser = new xml2js.Parser();

/**
 * Validates that an output string contains no tool call entries or disallowed symbols.
 * Checks for specific symbols and XML tags defined in `GLOBAL_CONFIG`, returning an error message if any are found.
 *
 * @param {string} output - The output string to validate, typically from an agent or model response.
 * @returns {Promise<string | null>} A promise that resolves to:
 *   - `"Tool call in text output"` if the string contains disallowed symbols (e.g., `{`, `}`) or XML tags (e.g., `<tool_call>`).
 *   - `null` if no tool calls or disallowed symbols are detected, indicating the output is valid.
 * @throws {Error} Propagates unhandled errors from XML parsing if `trycatch` fails to catch them, though typically returns `null` on parse failure.
 *
 * @example
 * // Basic usage with valid and invalid outputs
 * console.log(await validateNoToolCall("Hello, world!")); // null (valid)
 * console.log(await validateNoToolCall("Use {tool} now")); // "Tool call in text output" (disallowed symbol)
 * console.log(await validateNoToolCall("<tool_call>run</tool_call>")); // "Tool call in text output" (disallowed tag)
 *
 * @example
 * // Edge cases with malformed XML or mixed content
 * console.log(await validateNoToolCall("<invalid>")); // null (parsing fails silently, returns default)
 * console.log(await validateNoToolCall("Text <tool>action</tool>")); // "Tool call in text output" (disallowed tag)
 *
 * @remarks
 * This function:
 * - Uses `trycatch` from `functools-kit` to wrap the validation logic, returning `null` if an error occurs (e.g., XML parsing failure).
 * - Checks for disallowed symbols (from `GLOBAL_CONFIG.CC_AGENT_DISALLOWED_SYMBOLS`, e.g., `{`, `}`) using `String.includes`.
 * - Parses the output as XML with `xml2js.Parser` and checks for disallowed tags (from `GLOBAL_CONFIG.CC_AGENT_DISALLOWED_TAGS`,
 *   e.g., `tool_call`, `tool`) in the parsed result.
 * - Returns `"Tool call in text output"` as a generic error message for any detected tool call indicator, whether symbol- or tag-based.
 * - Handles malformed XML gracefully due to `trycatch`, avoiding crashes but potentially masking parsing issues.
 * Useful in the agent swarm system to filter out tool call artifacts from agent outputs (e.g., in `ClientAgent.validate`), ensuring clean text responses.
 * See the related GitHub issue for context on tool call handling challenges in similar systems.
 *
 * @see {@link https://github.com/ollama/ollama/issues/8287|GitHub Issue #8287} for background on tool call validation needs.
 * @see {@link ../config/params|GLOBAL_CONFIG} for disallowed symbols and tags configuration.
 * @see {@link https://www.npmjs.com/package/xml2js|xml2js} for XML parsing details.
 * @see {@link module:functools-kit.trycatch|trycatch} for error handling mechanics.
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
