import { randomString } from "functools-kit";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the assistant's history for a given client.
 * 
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Array>} - A promise that resolves to an array of history objects where the role is "assistant".
 */
export const getAssistantHistory = async (clientId: string) => {
  const methodName = "function getAssistantHistory"
  swarm.loggerService.log("function getAssistantHistory", {
    clientId,
  });
  const history = await getRawHistory(clientId, methodName);
  return history.filter(({ role }) => role === "assistant");
};
