import { randomString } from "functools-kit";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the last message sent by the tool from the client's message history.
 *
 * @param {string} clientId - The ID of the client whose message history is being retrieved.
 * @returns {Promise<string | null>} - The content of the last tool message, or null if no user message is found.
 */
export const getLastToolMessage = async (clientId: string) => {
  const requestId = randomString();
  swarm.loggerService.log("function getLastToolMessage", {
    clientId,
    requestId,
  });
  const history = await getRawHistory(clientId, requestId);
  const last = history.findLast(({ role }) => role === "tool");
  return last ? last.content : null;
};
