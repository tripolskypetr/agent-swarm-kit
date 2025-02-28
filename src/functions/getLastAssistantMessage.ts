import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the last message sent by the assistant from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last assistant message, or null if no user message is found.
 */
export const getLastAssistantMessage = async (clientId: string) => {
  const methodName = "function getLastAssistantMessage";
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function getLastAssistantMessage", {
      clientId,
    });
  const history = await getRawHistory(clientId, methodName);
  const last = history.findLast(({ role }) => role === "assistant");
  return last ? last.content : null;
};
