import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(`agent-swarm listenStateEvent session not found for clientId=${clientId}`);
  }
};

/**
 * Hook to subscribe to state events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {function} fn - The callback function to handle the event.
 */
export const listenStateEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenStateEvent", {
    clientId,
  });
  validateClientId(clientId);
  return swarm.busService.subscribe(
    clientId,
    "state-bus",
    queued(async (e) => await fn(e))
  );
};

export default listenStateEvent;
