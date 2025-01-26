import { queued, schedule } from "functools-kit";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";
import { commitUserMessage } from "./commitUserMessage";
import { getAgentName } from "./getAgentName";

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
const session = (clientId: string, swarmName: SwarmName) => {
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

/**
 * Creates a scheduled session for the given client and swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @returns {Object} An object containing the scheduled session methods.
 * @returns {TComplete} complete - A function to complete the session with content.
 * @returns {Function} dispose - A function to dispose of the session.
 */
session.scheduled = (clientId: string, swarmName: SwarmName) => {
  const { complete, dispose } = session(clientId, swarmName);

  let isMounted = true;

  /**
   * Completes the scheduled session with the given content.
   *
   * @param {string} content - The content to complete the session with.
   * @returns {Promise<string>} A promise that resolves with the result of the session execution.
   */
  const wrappedComplete: typeof complete = schedule(
    async (content: string) => {
      if (!isMounted) {
        return;
      }
      return await complete(content);
    },
    {
      onSchedule: async ([content]) => {
        if (!isMounted) {
          return;
        }
        await commitUserMessage(
          content,
          clientId,
          await getAgentName(clientId)
        );
      },
    }
  );

  return {
    /**
     * Completes the scheduled session with the given content.
     *
     * @param {string} content - The content to complete the session with.
     * @returns {Promise<string>} A promise that resolves with the result of the session execution.
     */
    async complete(content: string) {
      return await wrappedComplete(content);
    },
    /**
     * Disposes of the scheduled session.
     *
     * @returns {Promise<void>} A promise that resolves when the session is disposed.
     */
    async dispose() {
      isMounted = false;
      return await dispose();
    },
  };
};

export { session };
