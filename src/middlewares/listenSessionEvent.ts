import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";

/**
 * Hook to subscribe to session events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for.
 * @param {function} fn - The callback function to handle the session events.
 * @returns {function} - The unsubscribe function to stop listening to session events.
 */
export const listenSessionEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenSessionEvent", {
    clientId,
  });
  return swarm.busService.subscribe(
    clientId,
    "session",
    fn
  );
};

export default listenSessionEvent;
