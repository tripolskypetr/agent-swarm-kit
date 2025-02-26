import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(`agent-swarm listenSessionEvent session not found for clientId=${clientId}`);
  }
};

/**
 * Hook to subscribe to session events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for.
 * @param {function} fn - The callback function to handle the session events.
 */
export const listenSessionEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenSessionEvent", {
    clientId,
  });
  validateClientId(clientId);
  swarm.busService.subscribe(
    clientId,
    "session",
    fn
  );
};

export default listenSessionEvent;
