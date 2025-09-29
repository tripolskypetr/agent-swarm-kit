import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";
import beginContext from "../utils/beginContext";

/**
 * Validates the client ID for storage event listening, allowing wildcard "*" or checking for an active session.
 *
 * @throws {Error} If the client ID is not "*" and no active session exists for it.
 */
const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(
      `agent-swarm listenStorageEventOnce session not found for clientId=${clientId}`
    );
  }
};

/**
 * Subscribes to a single storage-specific event on the swarm bus service for a specific client, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events on the "storage-bus" topic associated with a given client ID, invoking the provided callback
 * with the event data when an event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment
 * and logs the operation via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing, and the listener
 * unsubscribes after the first matching event. The function supports a wildcard client ID ("*") for listening to all clients or validates a specific
 * client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenStorageEventOnce(
 *   "client-123",
 *   (event) => event.type === "update",
 *   (event) => console.log(event)
 * );
 * // Logs the first "update" storage event for "client-123"
 * unsubscribe(); // Cancels listener if not yet triggered
 */
export const listenStorageEventOnce = beginContext(
  (
    clientId: string,
    filterFn: (event: IBusEvent) => boolean,
    fn: (event: IBusEvent) => void
  ) => {
    // Log the operation details
    swarm.loggerService.log("middleware listenStorageEventOnce", {
      clientId,
    });

    // Validate the client ID
    validateClientId(clientId);

    // Subscribe to storage events for one occurrence with a filter and queued callback
    return swarm.busService.once(
      clientId,
      "storage-bus",
      filterFn,
      queued(async (e) => await fn(e))
    );
  }
);

export default listenStorageEventOnce;
