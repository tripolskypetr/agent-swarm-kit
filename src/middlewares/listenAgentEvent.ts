import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";

/**
 * Hook to subscribe to agent events for a specific client.
 *
 * @param {string} clientId - The ID of the client to subscribe to events for.
 * @param {function} fn - The callback function to handle the event.
 * @returns {function} - A function to unsubscribe from the event.
 */
export const listenAgentEvent = (
  clientId: string,
  fn: (event: IBusEvent) => void
) => {
  swarm.loggerService.log("middleware listenAgentEvent", {
    clientId,
  });
  return swarm.busService.subscribe(
    clientId,
    "agent",
    fn
  );
};

export default listenAgentEvent;
