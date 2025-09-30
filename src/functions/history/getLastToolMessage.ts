import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { getRawHistoryInternal } from "./getRawHistory";

const METHOD_NAME = "function.history.getLastToolMessage";

/**
 * Function implementation
*/
const getLastToolMessageInternal = beginContext(async (clientId: string): Promise<string | null> => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  // Fetch raw history and find the last tool message
  const history = await getRawHistoryInternal(clientId, METHOD_NAME);
  const last = history.findLast(({ role }) => role === "tool");
  return last?.content ? last.content : null;
});


/**
 * Retrieves the content of the most recent tool message from a client's session history.
 *
 * This function fetches the raw history for a specified client using `getRawHistory` and finds the last entry where the role is "tool".
 * It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The result is the content
 * of the last tool message as a string, or `null` if no tool message exists in the history.
 *
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @throws {Error} If `getRawHistory` fails due to session validation or history retrieval issues.
 * @example
 * const lastMessage = await getLastToolMessage("client-123");
 * console.log(lastMessage); // Outputs the last tool message or null
*/
export async function getLastToolMessage(clientId: string) {
  return await getLastToolMessageInternal(clientId);
}
