import { EventSource, ICustomEvent } from "../../model/Event.model";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.event.listenEvent";

/**
 * Set of reserved event source names that cannot be used for custom events.
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
 * Emits a custom event to the swarm bus service.
 *
 * This function sends a custom event with a specified topic and payload to the swarm's bus service, allowing clients to broadcast messages
 * for other components to listen to. It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled.
 * The function enforces a restriction on reserved topic names (defined in `DISALLOWED_EVENT_SOURCE_LIST`), throwing an error if a reserved
 * topic is used. The event is structured as an `ICustomEvent` with the provided `clientId`, `topicName` as the source, and `payload`.
 *
 * @template T - The type of the payload, defaulting to `any` if unspecified.
 * @param {string} clientId - The unique identifier of the client emitting the event.
 * @param {string} topicName - The name of the event topic (must not be a reserved source).
 * @param {T} payload - The payload data to be included in the event.
 * @returns {Promise<void>} A promise that resolves when the event is successfully emitted.
 * @throws {Error} If the `topicName` is a reserved event source (e.g., "agent-bus", "session-bus").
 * @example
 * await event("client-123", "custom-topic", { message: "Hello, swarm!" });
 * // Emits an event with topic "custom-topic" and payload { message: "Hello, swarm!" }
 */
export const event = beginContext(
  (clientId: string, topicName: string, payload: object) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
      });

    // Check if the topic name is reserved
    if (DISALLOWED_EVENT_SOURCE_LIST.has(topicName)) {
      throw new Error(
        `agent-swarm event topic is reserved topicName=${topicName}`
      );
    }

    // Emit the event to the bus service
    return swarm.busService.emit<ICustomEvent>(clientId, {
      source: topicName,
      payload,
      clientId,
    });
  }
) as <T extends unknown = any>(
  clientId: string,
  topicName: string,
  payload: T
) => Promise<void>;
