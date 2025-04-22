import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { getRawHistory } from "./getRawHistory";

const METHOD_NAME = "function.history.getLastSystemMessage";

/**
 * Retrieves the content of the most recent system message from a client's session history.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "system".
 * It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is the content
 * of the last system message as a string, or `null` if no system message exists in the history.
 *
 * @param {string} clientId - The unique identifier of the client session whose last system message is to be retrieved.
 * @returns {Promise<string | null>} A promise that resolves to the content of the last system message, or `null` if none is found.
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const lastMessage = await getLastSystemMessage("client-123");
 * console.log(lastMessage); // Outputs the last system message or null
 */
export const getLastSystemMessage = beginContext(async (clientId: string): Promise<string | null> => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  // Fetch raw history and find the last system message
  const history = await getRawHistory(clientId, METHOD_NAME);
  const last = history.findLast(({ role }) => role === "system");
  return last ? last.content : null;
});
