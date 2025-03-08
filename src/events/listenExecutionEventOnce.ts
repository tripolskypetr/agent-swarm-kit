import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";

const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(`agent-swarm listenExecutionEventOnce session not found for clientId=${clientId}`);
  }
};

/**
 * Hook to subscribe to agent events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 */
export const listenExecutionEventOnce = (
  clientId: string,
  filterFn: (event: IBusEvent) => boolean,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenExecutionEventOnce", {
    clientId,
  });
  validateClientId(clientId);
  return swarm.busService.once(
    clientId,
    "execution-bus",
    filterFn,
    queued(async (e) => await fn(e))
  );
};

export default listenExecutionEventOnce;
