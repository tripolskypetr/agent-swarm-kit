/**
 * Removes XML-like blocks — the tags TOGETHER with everything between them — from a string, cleaning up excess whitespace.
 * Any `<tag>content</tag>` pair is stripped entirely (tag and content), so only text outside such blocks survives.
 * Returns an empty string if the input is falsy.
 *
 * @example
 * // Whole blocks are removed, including their contents
 * console.log(removeXmlTags("<p>Hello</p>")); // ""
 * console.log(removeXmlTags("Text <tool>action</tool>")); // "Text"
 * console.log(removeXmlTags("No tags here")); // "No tags here"
 *
 * @example
 * // Edge cases
 * console.log(removeXmlTags("<think>\nreasoning\n</think>Answer")); // "Answer"
 * console.log(removeXmlTags("<invalid>")); // "<invalid>" (unpaired tags are kept)
 * console.log(removeXmlTags("")); // ""
 * console.log(removeXmlTags(null)); // ""
 *
 * @remarks
 * This function:
 * - Returns an empty string (`""`) for falsy inputs (e.g., `null`, `undefined`, empty string) to ensure safe handling.
 * - Uses a regular expression (`/<[^>]+>[\s\S]*?<\/[^>]+>/g`) to match an opening tag, its (non-greedy) contents across
 *   newlines, and a closing tag, removing the whole block; unpaired tags without a closing counterpart are left as-is.
 * - Collapses multiple consecutive newlines (`\n\s*\n`) into a single newline (`\n`) to clean up formatting.
 * - Trims leading and trailing whitespace from the final result for a polished output.
 * Useful in the agent swarm system for stripping structured blocks from model outputs — e.g., `<think>…</think>`
 * reasoning sections or inline `<tool_call>…</tool_call>` artifacts — leaving only the plain-text answer.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions|Regular Expressions}
 * for details on the regex patterns used.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace|String.replace}
 * for string replacement mechanics.
*/
export const removeXmlTags = (input: string) => {
  if (!input) {
    return "";
  }
  return input
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();
};

export default removeXmlTags;
