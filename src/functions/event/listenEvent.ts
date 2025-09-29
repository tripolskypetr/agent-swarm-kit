import { EventSource, ICustomEvent } from "../../model/Event.model";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { queued } from "functools-kit";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.event.listenEvent";

/**
 * Set of reserved event source names that cannot be used for custom event topics.
 * @constant {Set<EventSource>}
 */
const DISALLOWED_EVENT_SOURCE_LIST: Set<EventSource> = new Set([
  "agent-bus",
  "history-bus",
  "session-bus",
  "state-bus",
  "storage-bus",
  "swarm-bus",
  "execution-bus",
  "policy-bus",
]);

/**
 * Validates the client ID for event listening, allowing wildcard "*" or checking for an active session.
 *
 * @throws {Error} If the client ID is not "*" and no active session exists for it.
 */
const validateClientId = (clientId: string) => {
  if (clientId === "*") {
    return;
  }
  if (!swarm.sessionValidationService.hasSession(clientId)) {
    throw new Error(
      `agent-swarm listenEvent session not found for clientId=${clientId}`
    );
  }
};

/**
 * Function implementation
 */
const listenEventInternal = beginContext(
  (clientId: string, topicName: string, fn: (data: unknown) => void) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
      });

    // Check if the topic name is reserved
    if (DISALLOWED_EVENT_SOURCE_LIST.has(topicName)) {
      throw new Error(
        `agent-swarm listenEvent topic is reserved topicName=${topicName}`
      );
    }

    // Validate the client ID
    validateClientId(clientId);

    // Subscribe to the event with a queued callback
    return swarm.busService.subscribe<ICustomEvent<object>>(
      clientId,
      topicName,
      queued(async ({ payload }) => await fn(payload))
    );
  }
);

/**
 * Subscribes to a custom event on the swarm bus service and executes a callback when the event is received.
 *
 * This function sets up a listener for events with a specified topic on the swarm's bus service, invoking the provided callback with the event's
 * payload when triggered. It is wrapped in `beginContext` for a clean execution environment, logs the operation if enabled, and enforces restrictions
 * on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`). The callback is queued to ensure sequential processing of events. The function
 * supports a wildcard client ID ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to stop
 * listening.
 *
 * @template T - The type of the payload data, defaulting to `any` if unspecified.
 * @throws {Error} If the `topicName` is a reserved event source (e.g., "agent-bus"), or if the `clientId` is not "*" and no session exists.
 * @example
 * const unsubscribe = listenEvent("client-123", "custom-topic", (data) => console.log(data));
 * // Logs payload when "custom-topic" event is received for "client-123"
 * unsubscribe(); // Stops listening
 */
export function listenEvent<T extends unknown = any>(
  clientId: string,
  topicName: string,
  fn: (data: T) => void
) {
  return listenEventInternal(clientId, topicName, fn);
}
