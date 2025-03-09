import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";
import beginContext from "src/utils/beginContext";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(
      `agent-swarm listenSwarmEvent session not found for clientId=${clientId}`
    );
  }
};

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
export const listenSwarmEvent = beginContext(
  (clientId: string, fn: (event: IBusEvent) => void) => {
    swarm.loggerService.log("middleware listenSwarmEvent", {
      clientId,
    });
    validateClientId(clientId);
    return swarm.busService.subscribe(
      clientId,
      "swarm-bus",
      queued(async (e) => await fn(e))
    );
  }
);

export default listenSwarmEvent;
