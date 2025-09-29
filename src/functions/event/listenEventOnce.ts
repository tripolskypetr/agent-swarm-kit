import { EventSource, ICustomEvent } from "../../model/Event.model";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { queued } from "functools-kit";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.event.listenEventOnce";

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
      `agent-swarm listenEventOnce session not found for clientId=${clientId}`
    );
  }
};

/**
 * Function implementation
 */
const listenEventOnceInternal = beginContext(
  (
    clientId: string,
    topicName: string,
    filterFn: (event: unknown) => boolean,
    fn: (data: unknown) => void
  ) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
      });

    // Check if the topic name is reserved
    if (DISALLOWED_EVENT_SOURCE_LIST.has(topicName)) {
      throw new Error(
        `agent-swarm listenEventOnce topic is reserved topicName=${topicName}`
      );
    }

    // Validate the client ID
    validateClientId(clientId);

    // Subscribe to the event for one occurrence with a filter and queued callback
    return swarm.busService.once<ICustomEvent<object>>(
      clientId,
      topicName,
      ({ payload }) => filterFn(payload),
      queued(async ({ payload }) => await fn(payload))
    );
  }
);


/**
 * Subscribes to a custom event on the swarm bus service for a single occurrence, executing a callback when the event matches a filter.
 *
 * This function sets up a one-time listener for events with a specified topic on the swarm's bus service, invoking the provided callback with the
 * event's payload when the event is received and passes the filter condition. It is wrapped in `beginContext` for a clean execution environment,
 * logs the operation if enabled, and enforces restrictions on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`). The callback is
 * queued to ensure sequential processing, and the listener unsubscribes after the first matching event. The function supports a wildcard client ID
 * ("*") for listening to all clients or validates a specific client session. It returns an unsubscribe function to cancel the listener prematurely.
 *
 * @template T - The type of the payload data, defaulting to `any` if unspecified.
 * @throws {Error} If the `topicName` is a reserved event source (e.g., "agent-bus"), or if the `clientId` is not "*" and no session exists.
 * @example
 * const unsubscribe = listenEventOnce(
 *   "client-123",
 *   "custom-topic",
 *   (data) => data.value > 0,
 *   (data) => console.log(data)
 * );
 * // Logs payload once when "custom-topic" event with value > 0 is received
 * unsubscribe(); // Cancels listener if not yet triggered
 */
export function listenEventOnce<T extends unknown = any>(
  clientId: string,
  topicName: string,
  filterFn: (event: T) => boolean,
  fn: (data: T) => void
) {
  return listenEventOnceInternal(clientId, topicName, filterFn, fn);
}
