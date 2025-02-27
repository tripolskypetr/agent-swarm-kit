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
  const requestId = randomString();
  swarm.loggerService.log("function getAssistantHistory", {
    clientId,
    requestId,
  });
  const history = await getRawHistory(clientId, requestId);
  return history.filter(({ role }) => role === "assistant");
};
