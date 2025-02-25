import IBaseEvent from "../model/Event.model";
import swarm from "../lib";

/**
 * Hook to subscribe to state events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to.
 * @param {function} fn - The callback function to handle the event.
 * @returns {function} - The unsubscribe function to stop listening to the events.
 */
export const listenStateEvent = (
  clientId: string,
  fn: (event: IBaseEvent) => void
) => {
  swarm.loggerService.log("middleware listenStateEvent", {
    clientId,
  });
  return swarm.busService.subscribe(
    clientId,
    "state",
    fn
  );
};

export default listenStateEvent;
