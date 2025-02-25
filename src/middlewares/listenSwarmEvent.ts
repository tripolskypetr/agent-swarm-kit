import IBaseEvent from "../model/Event.model";
import swarm from "../lib";

/**
 * Hook to subscribe to swarm events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {(event: IBaseEvent) => void} fn - The callback function to handle the event.
 * @returns {Function} - A function to unsubscribe from the event.
 */
export const listenSwarmEvent = (
  clientId: string,
  fn: (event: IBaseEvent) => void
) => {
  swarm.loggerService.log("middleware listenSwarmEvent", {
    clientId,
  });
  return swarm.busService.subscribe(
    clientId,
    "swarm",
    fn
  );
};

export default listenSwarmEvent;
