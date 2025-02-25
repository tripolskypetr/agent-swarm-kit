import IBaseEvent from "../model/Event.model";
import swarm from "../lib";

/**
 * Hook to subscribe to history events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {(event: IBaseEvent) => void} fn - The callback function to handle the event.
 * @returns {Function} - The unsubscribe function.
 */
export const listenHistoryEvent = (
  clientId: string,
  fn: (event: IBaseEvent) => void
) => {
  swarm.loggerService.log("middleware listenHistoryEvent", {
    clientId,
  });
  return swarm.busService.subscribe(
    clientId,
    "history",
    fn
  );
};

export default listenHistoryEvent;
