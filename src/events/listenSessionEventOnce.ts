import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";
import beginContext from "../utils/beginContext";

/**
 * Validates the client ID for session event listening, allowing wildcard "*" or checking for an active session.
 *
 * @param {string} clientId - The client ID to validate.
 * @throws {Error} If the client ID is not "*" and no active session exists for it.
 */
const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(
      `agent-swarm listenSessionEventOnce session not found for clientId=${clientId}`
    );
  }
};

/**
 * Subscribes to a single session-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "session-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @param {string} clientId - The ID of the client to subscribe to session events for, or "*" to listen to all clients.
 * @param {(event: IBusEvent) => boolean} filterFn - A function that filters events, returning true to trigger the callback with that event.
 * @param {(event: IBusEvent) => void} fn - The callback function to execute once when a matching session event is received, passed the event object.
 * @returns {() => void} A function to unsubscribe from the session event listener before it triggers.
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenSessionEventOnce(
 *   "client-123",
 *   (event) => event.type === "start",
 *   (event) => console.log(event)
 * );
 * // Logs the first "start" session event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
export const listenSessionEventOnce = beginContext(
  (
    clientId: string,
    filterFn: (event: IBusEvent) => boolean,
    fn: (event: IBusEvent) => void
  ) => {
    // Log the operation details
    swarm.loggerService.log("middleware listenSessionEventOnce", {
      clientId,
    });

    // Validate the client ID
    validateClientId(clientId);

    // Subscribe to session events for one occurrence with a filter and queued callback
    return swarm.busService.once(
      clientId,
      "session-bus",
      filterFn,
      queued(async (e) => await fn(e))
    );
  }
);

export default listenSessionEventOnce;
