import { memoize, Subject } from "functools-kit";
import { inject } from "../../../lib/core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../../lib/core/types";
import { IBus } from "../../../interfaces/Bus.interface";
import IBaseEvent, { EventSource } from "../../../model/Event.model";

export class BusService implements IBus {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _eventSourceSet = new Set<EventSource>();

  private getEventSubject = memoize<
    (clientId: string, source: EventSource) => Subject<IBaseEvent>
  >(
    ([clientId, source]) => `${clientId}-${source}`,
    () => new Subject()
  );

  /**
   * Subscribes to events for a specific client and source.
   * @param {string} clientId - The client ID.
   * @param {EventSource} source - The event source.
   * @param {(event: T) => void} fn - The callback function to handle the event.
   * @returns {Subscription} The subscription object.
   */
  public subscribe = <T extends IBaseEvent>(
    clientId: string,
    source: EventSource,
    fn: (event: T) => void
  ) => {
    this.loggerService.log(`busService subscribe`, {
      clientId,
      source,
    });
    this._eventSourceSet.add(source);
    return this.getEventSubject(clientId, source).subscribe(fn);
  };

  /**
   * Subscribes to a single event for a specific client and source.
   * @param {string} clientId - The client ID.
   * @param {EventSource} source - The event source.
   * @param {(event: T) => boolean} filterFn - The filter function to determine if the event should be handled.
   * @param {(event: T) => void} fn - The callback function to handle the event.
   * @returns {Subscription} The subscription object.
   */
  public once = <T extends IBaseEvent>(
    clientId: string,
    source: EventSource,
    filterFn: (event: T) => boolean,
    fn: (event: T) => void
  ) => {
    this.loggerService.log(`busService once`, {
      clientId,
      source,
    });
    this._eventSourceSet.add(source);
    return this.getEventSubject(clientId, source).filter(filterFn).once(fn);
  };

  /**
   * Emits an event for a specific client.
   * @param {string} clientId - The client ID.
   * @param {T} event - The event to emit.
   * @returns {Promise<void>} A promise that resolves when the event has been emitted.
   */
  public emit = async <T extends IBaseEvent>(clientId: string, event: T) => {
    this.loggerService.debug(`busService emit`, {
      clientId,
      event,
    });
    if (!this.getEventSubject.has(`${clientId}-${event.source}`)) {
      return;
    }
    await this.getEventSubject(clientId, event.source).next(event);
  };

  /**
   * Disposes of all event subscriptions for a specific client.
   * @param {string} clientId - The client ID.
   */
  public dispose = (clientId: string) => {
    this.loggerService.log(`busService dispose`, {
      clientId,
    });
    for (const source of this._eventSourceSet) {
      const key = `${clientId}-${source}`;
      if (this.getEventSubject.has(key)) {
        this.getEventSubject(clientId, source).unsubscribeAll();
      }
      this.getEventSubject.clear(`${clientId}-${source}`);
    }
  };
}

export default BusService;
