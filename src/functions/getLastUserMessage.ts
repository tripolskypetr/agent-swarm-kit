import { randomString } from "functools-kit";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the last message sent by the user from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last user message, or null if no user message is found.
 */
export const getLastUserMessage = async (clientId: string) => {
  const methodName = "function getLastUserMessage"
  swarm.loggerService.log("function getLastUserMessage", {
    clientId,
  });
  const history = await getRawHistory(clientId, methodName);
  const last = history.findLast(({ role, mode }) => role === "user" && mode === "user");
  return last ? last.content : null;
};
