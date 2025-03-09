import beginContext from "src/utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { getRawHistory } from "./getRawHistory";

const METHOD_NAME = "function.history.getAssistantHistory";

/**
 * Retrieves the assistant's history for a given client.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Array>} - A promise that resolves to an array of history objects where the role is "assistant".
 */
export const getAssistantHistory = beginContext(async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  const history = await getRawHistory(clientId, METHOD_NAME);
  return history.filter(({ role }) => role === "assistant");
});
