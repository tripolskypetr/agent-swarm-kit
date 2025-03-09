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
      `agent-swarm listenAgentEvent session not found for clientId=${clientId}`
    );
  }
};

/**
 * Hook to subscribe to agent events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
export const listenAgentEvent = beginContext(
  (clientId: string, fn: (event: IBusEvent) => void) => {
    swarm.loggerService.log("middleware listenAgentEvent", {
      clientId,
    });
    validateClientId(clientId);
    return swarm.busService.subscribe(
      clientId,
      "agent-bus",
      queued(async (e) => await fn(e))
    );
  }
);

export default listenAgentEvent;
