import { EventSource, ICustomEvent } from "../../model/Event.model";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { queued } from "functools-kit";
import beginContext from "../..//utils/beginContext";

const METHOD_NAME = "function.event.listenEvent";

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
 * Listens for an event on the swarm bus service and executes a callback function when the event is received.
 *
 * @template T - The type of the data payload.
 * @param {string} clientId - The ID of the client to listen for events from.
 * @param {(data: T) => void} fn - The callback function to execute when the event is received. The data payload is passed as an argument to this function.
 */
export const listenEvent = beginContext(
  (clientId: string, topicName: string, fn: (data: object) => void) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
      });
    if (DISALLOWED_EVENT_SOURCE_LIST.has(topicName)) {
      throw new Error(
        `agent-swarm listenEvent topic is reserved topicName=${topicName}`
      );
    }
    validateClientId(clientId);
    return swarm.busService.subscribe<ICustomEvent<object>>(
      clientId,
      topicName,
      queued(async ({ payload }) => await fn(payload))
    );
  }
) as <T extends unknown = any>(
  clientId: string,
  topicName: string,
  fn: (data: T) => void
) => () => void;
