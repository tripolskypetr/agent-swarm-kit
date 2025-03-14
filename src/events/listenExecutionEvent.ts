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
      `agent-swarm listenExecutionEvent session not found for clientId=${clientId}`
    );
  }
};

/**
 * Hook to subscribe to execution events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
export const listenExecutionEvent = beginContext(
  (clientId: string, fn: (event: IBusEvent) => void) => {
    swarm.loggerService.log("middleware listenExecutionEvent", {
      clientId,
    });
    validateClientId(clientId);
    return swarm.busService.subscribe(
      clientId,
      "execution-bus",
      queued(async (e) => await fn(e))
    );
  }
);

export default listenExecutionEvent;
