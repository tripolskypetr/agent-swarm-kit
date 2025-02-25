import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";

/**
 * Hook to subscribe to storage events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to storage events for.
 * @param {function} fn - The callback function to handle the storage event.
 * @returns {function} - A function to unsubscribe from the storage events.
 */
export const listenStorageEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenStorageEvent", {
    clientId,
  });
  return swarm.busService.subscribe(
    clientId,
    "storage",
    fn
  );
};

export default listenStorageEvent;
