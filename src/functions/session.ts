import { queued } from "functools-kit";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";

type TComplete = (content: string) => Promise<string>;

/**
 * Creates a session for the given client and swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Object} An object containing the session methods.
 * @returns {TComplete} complete - A function to complete the session with content.
 * @returns {Function} dispose - A function to dispose of the session.
 */
export const session = (clientId: string, swarmName: SwarmName) => {
  swarm.loggerService.log("function session", {
    clientId,
    swarmName,
  });
  swarm.swarmValidationService.validate(swarmName, "session");
  swarm.sessionValidationService.addSession(clientId, swarmName, "session");
  return {
    /**
     * Completes the session with the given content.
     *
     * @param {string} content - The content to complete the session with.
     * @returns {Promise<string>} A promise that resolves with the result of the session execution.
     */
    complete: queued(async (content: string) => {
      swarm.sessionValidationService.validate(clientId, "session");
      return await swarm.sessionPublicService.execute(
        content,
        clientId,
        swarmName
      );
    }) as TComplete,

    /**
     * Disposes of the session.
     *
     * @returns {Promise<void>} A promise that resolves when the session is disposed.
     */
    dispose: async () => {
      return await disposeConnection(clientId, swarmName);
    },
  };
};
