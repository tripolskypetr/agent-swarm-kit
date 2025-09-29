import { IBusEvent } from "../model/Event.model";
import swarm from "../lib";
import { queued } from "functools-kit";
import beginContext from "../utils/beginContext";

/**
 * Validates the client ID for policy event listening, allowing wildcard "*" or checking for an active session.
 *
 * @throws {Error} If the client ID is not "*" and no active session exists for it.
 */
const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(
      `agent-swarm listenPolicyEvent session not found for clientId=${clientId}`
    );
  }
};

/**
 * Subscribes to policy-specific events on the swarm bus service for a specific client and executes a callback for each event.
 *
 * This function sets up a listener for events on the "policy-bus" topic associated with a given client ID, invoking the provided callback with
 * the event data whenever a policy event is received. It is wrapped in `beginContext` for a clean execution environment and logs the operation
 * via `loggerService`. The callback is queued using `functools-kit` to ensure sequential processing of events. The function supports a wildcard
 * client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop listening.
 *
 * @throws {Error} If the `clientId` is not "*" and no active session exists for it.
 * @example
 * const unsubscribe = listenPolicyEvent("client-123", (event) => console.log(event));
 * // Logs each policy event for "client-123"
 * unsubscribe(); // Stops listening
 */
export const listenPolicyEvent = beginContext(
  (clientId: string, fn: (event: IBusEvent) => void) => {
    // Log the operation details
    swarm.loggerService.log("middleware listenPolicyEvent", {
      clientId,
    });

    // Validate the client ID
    validateClientId(clientId);

    // Subscribe to policy events with a queued callback
    return swarm.busService.subscribe(
      clientId,
      "policy-bus",
      queued(async (e) => await fn(e))
    );
  }
);

export default listenPolicyEvent;
