import beginContext from "src/utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { getRawHistory } from "./getRawHistory";

const METHOD_NAME = "function.history.getLastUserMessage";

/**
 * Retrieves the last message sent by the user from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last user message, or null if no user message is found.
 */
export const getLastUserMessage = beginContext(async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  const history = await getRawHistory(clientId, METHOD_NAME);
  const last = history.findLast(
    ({ role, mode }) => role === "user" && mode === "user"
  );
  return last ? last.content : null;
});
