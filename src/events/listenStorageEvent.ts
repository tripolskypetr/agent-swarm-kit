import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(`agent-swarm listenStorageEvent session not found for clientId=${clientId}`);
  }
};

/**
 * Hook to subscribe to storage events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for.
 * @param {function} fn - The callback function to handle the storage event.
 */
export const listenStorageEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenStorageEvent", {
    clientId,
  });
  validateClientId(clientId)
  return swarm.busService.subscribe(
    clientId,
    "storage-bus",
    queued(async (e) => await fn(e))
  );
};

export default listenStorageEvent;
