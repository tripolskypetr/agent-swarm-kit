import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the assistant's history for a given client.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Array>} - A promise that resolves to an array of history objects where the role is "assistant".
 */
export const getAssistantHistory = async (clientId: string) => {
  const methodName = "function getAssistantHistory";
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function getAssistantHistory", {
      clientId,
    });
  const history = await getRawHistory(clientId, methodName);
  return history.filter(({ role }) => role === "assistant");
};
