import IBaseEvent from "../model/Event.model";

/**
 * Interface representing a Bus.
 */
export interface IBus {
  /**
   * Emits an event to a specific client.
   * 
   * @template T - The type of event extending IBaseEvent.
   * @param {string} clientId - The ID of the client to emit the event to.
   * @param {T} event - The event to emit.
   * @returns {Promise<void>} A promise that resolves when the event has been emitted.
   */
  emit<T extends IBaseEvent>(clientId: string, event: T): Promise<void>;
}
