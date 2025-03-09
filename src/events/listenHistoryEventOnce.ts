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
      `agent-swarm listenHistoryEventOnce session not found for clientId=${clientId}`
    );
  }
};

/**
 * Hook to subscribe to history events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {(event: IBusEvent) => void} fn - The callback function to handle the event.
 */
export const listenHistoryEventOnce = beginContext(
  (
    clientId: string,
    filterFn: (event: IBusEvent) => boolean,
    fn: (event: IBusEvent) => void
  ) => {
    swarm.loggerService.log("middleware listenHistoryEventOnce", {
      clientId,
    });
    validateClientId(clientId);
    return swarm.busService.once(
      clientId,
      "history-bus",
      filterFn,
      queued(async (e) => await fn(e))
    );
  }
);

export default listenHistoryEventOnce;
