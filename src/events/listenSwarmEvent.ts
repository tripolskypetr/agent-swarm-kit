import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(`agent-swarm listenSwarmEvent session not found for clientId=${clientId}`);
  }
};

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
export const listenSwarmEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenSwarmEvent", {
    clientId,
  });
  validateClientId(clientId);
  swarm.busService.subscribe(
    clientId,
    "swarm-bus",
    fn
  );
};

export default listenSwarmEvent;
