/**
 * Removes XML tags and their contents from a string, cleaning up excess whitespace.
 * Strips all matched XML-like tags (e.g., `<tag>content</tag>`) and normalizes newlines, returning a trimmed result.
 *
 *                  Returns an empty string if the input is falsy.
 *
 * @example
 * // Basic usage with XML tags
 * console.log(removeXmlTags("<p>Hello</p>")); // "Hello"
 * console.log(removeXmlTags("<div><span>Text</span></div>")); // "Text"
 * console.log(removeXmlTags("No tags here")); // "No tags here"
 *
 * @example
 * // Handling multiline input and edge cases
 * console.log(removeXmlTags("<tag>\nLine1\nLine2\n</tag>")); // "Line1\nLine2"
 * console.log(removeXmlTags("<tag>  <nested>Text</nested>  </tag>")); // "Text"
 * console.log(removeXmlTags("")); // ""
 * console.log(removeXmlTags(null)); // ""
 *
 * @remarks
 * This function:
 * - Returns an empty string (`""`) for falsy inputs (e.g., `null`, `undefined`, empty string) to ensure safe handling.
 * - Uses a regular expression (`/<[^>]+>[\s\S]*?<\/[^>]+>/g`) to match and remove XML tags and their contents, including nested tags,
 *   where `[\s\S]*?` ensures non-greedy matching across newlines.
 * - Collapses multiple consecutive newlines (`\n\s*\n`) into a single newline (`\n`) to clean up formatting.
 * - Trims leading and trailing whitespace from the final result for a polished output.
 * Useful in the agent swarm system for sanitizing model outputs, user inputs, or logs that may contain XML markup,
 * such as when processing tool call responses or cleaning structured text.
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
