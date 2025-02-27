import { randomString } from "functools-kit";
import swarm from "../lib";
import { getRawHistory } from "./getRawHistory";

/**
 * Retrieves the user history for a given client ID.
 *
 * @param {string} clientId - The ID of the client whose history is to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array of history objects filtered by user role.
 */
export const getUserHistory = async (clientId: string) => {
  const methodName = "function getUserHistory"
  swarm.loggerService.log("function getUserHistory", {
    clientId,
  });
  const history = await getRawHistory(clientId, methodName);
  return history.filter(({ role, mode }) => role === "user" && mode === "user");
};
