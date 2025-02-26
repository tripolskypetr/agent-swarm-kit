import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(`agent-swarm listenHistoryEvent session not found for clientId=${clientId}`);
  }
};

/**
 * Hook to subscribe to history events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
export const listenHistoryEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenHistoryEvent", {
    clientId,
  });
  validateClientId(clientId);
  swarm.busService.subscribe(
    clientId,
    "history",
    fn
  );
};

export default listenHistoryEvent;
