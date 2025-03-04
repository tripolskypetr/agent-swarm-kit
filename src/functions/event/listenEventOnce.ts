import { EventSource, ICustomEvent } from "../../model/Event.model";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.listenEventOnce";

const DISALLOWED_EVENT_SOURCE_LIST: Set<EventSource> = new Set([
  "agent-bus",
  "history-bus",
  "session-bus",
  "state-bus",
  "storage-bus",
  "swarm-bus",
]);

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
 * Listens for an event on the swarm bus service and executes a callback function when the event is received.
 *
 * @template T - The type of the data payload.
 * @param {string} clientId - The ID of the client to listen for events from.
 * @param {(data: T) => void} fn - The callback function to execute when the event is received. The data payload is passed as an argument to this function.
 */
export const listenEventOnce = <T extends unknown = any>(
  clientId: string,
  topicName: string,
  filterFn: (event: T) => boolean,
  fn: (data: T) => void
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  if (DISALLOWED_EVENT_SOURCE_LIST.has(topicName)) {
    throw new Error(
      `agent-swarm listenEventOnce topic is reserved topicName=${topicName}`
    );
  }
  validateClientId(clientId);
  return swarm.busService.once<ICustomEvent<T>>(
    clientId,
    topicName,
    ({ payload }) => filterFn(payload),
    ({ payload }) => fn(payload)
  );
};
