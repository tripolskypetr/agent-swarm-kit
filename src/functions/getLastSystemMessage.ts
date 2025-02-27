import { randomString } from "functools-kit";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the last message sent by the system from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last system message, or null if no user message is found.
 */
export const getLastSystemMessage = async (clientId: string) => {
  const methodName = "function getLastSystemMessage"
  swarm.loggerService.log("function getLastSystemMessage", {
    clientId,
  });
  const history = await getRawHistory(clientId, methodName);
  const last = history.findLast(({ role }) => role === "system");
  return last ? last.content : null;
};
