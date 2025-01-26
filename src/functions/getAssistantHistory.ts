import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the assistant's history for a given client.
 * 
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Array>} - A promise that resolves to an array of history objects where the role is "assistant".
 */
export const getAssistantHistory = async (clientId: string) => {
  swarm.loggerService.log("function getAssistantHistory", {
    clientId,
  });
  const history = await getRawHistory(clientId);
  return history.filter(({ role }) => role === "assistant");
};
