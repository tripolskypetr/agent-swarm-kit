import { EventSource, ICustomEvent } from "../model/Event.model";
import swarm from "../lib";

const DISALLOWED_EVENT_SOURCE_LIST: Set<EventSource> = new Set([
    "agent-bus",
    "history-bus",
    "session-bus",
    "state-bus",
    "storage-bus",
    "swarm-bus",
]);

/**
 * Emits an event to the swarm bus service.
 *
 * @template T - The type of the payload.
 * @param {string} clientId - The ID of the client emitting the event.
 * @param {T} payload - The payload of the event.
 * @returns {boolean} - Returns true if the event was successfully emitted.
 */
export const event = <T extends unknown = any>(
  clientId: string,
  topicName: string,
  payload: T
) => {
  swarm.loggerService.log("function listenEvent", {
    clientId,
  });
  if (DISALLOWED_EVENT_SOURCE_LIST.has(topicName)) {
    throw new Error(`agent-swarm event topic is reserved topicName=${topicName}`);
  }
  return swarm.busService.emit<ICustomEvent>(clientId, {
    source: topicName,
    payload,
    clientId,
  })
};
