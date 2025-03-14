import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";
import beginContext from "../utils/beginContext";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(
      `agent-swarm listenStorageEventOnce session not found for clientId=${clientId}`
    );
  }
};

/**
 * Hook to subscribe to storage events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for.
 * @param {function} fn - The callback function to handle the storage event.
 */
export const listenStorageEventOnce = beginContext(
  (
    clientId: string,
    filterFn: (event: IBusEvent) => boolean,
    fn: (event: IBusEvent) => void
  ) => {
    swarm.loggerService.log("middleware listenStorageEventOnce", {
      clientId,
    });
    validateClientId(clientId);
    return swarm.busService.once(
      clientId,
      "storage-bus",
      filterFn,
      queued(async (e) => await fn(e))
    );
  }
);

export default listenStorageEventOnce;
