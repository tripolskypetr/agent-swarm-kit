import { memoize, Subject } from "functools-kit";
import { inject } from "../../../lib/core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../../lib/core/types";
import { IBus } from "../../../interfaces/Bus.interface";
import IBaseEvent, {
  EventSource,
  IBusEvent,
  IBusEventContext,
} from "../../../model/Event.model";
import SessionValidationService from "../validation/SessionValidationService";
import { GLOBAL_CONFIG } from "../../../config/params";

export class BusService implements IBus {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  private _eventSourceSet = new Set<EventSource>();
  private _eventWildcardMap = new Map<EventSource, boolean>();

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
   */
  public subscribe = <T extends IBaseEvent>(
    clientId: string,
    source: EventSource,
    fn: (event: T) => void
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`busService subscribe`, {
        clientId,
        source,
      });
    if (clientId === "*") {
      this._eventWildcardMap.set(source, true);
    }
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
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`busService once`, {
        clientId,
        source,
      });
    if (clientId === "*") {
      this._eventWildcardMap.set(source, true);
    }
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
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`busService emit`, {
        clientId,
        event,
      });
    if (!this.sessionValidationService.hasSession(clientId)) {
      return;
    }
    if (this.getEventSubject.has(`${clientId}-${event.source}`)) {
      await this.getEventSubject(clientId, event.source).next(event);
    }
    if (this._eventWildcardMap.has(event.source)) {
      await this.getEventSubject("*", event.source).next(event);
    }
  };

  /**
   * Alias to emit the execution begin event
   */
  public commitExecutionBegin = async (
    clientId: string,
    context: Partial<IBusEventContext>
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`busService commitExecutionBegin`, {
        clientId,
      });
    await this.emit<IBusEvent>(clientId, {
      type: "commit-execution-begin",
      clientId,
      context,
      input: {},
      output: {},
      source: "execution-bus",
    });
  };

  /**
   * Alias to emit the execution end event
   */
  public commitExecutionEnd = async (
    clientId: string,
    context: Partial<IBusEventContext>
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`busService commitExecutionEnd`, {
        clientId,
      });
    await this.emit<IBusEvent>(clientId, {
      type: "commit-execution-end",
      clientId,
      context,
      input: {},
      output: {},
      source: "execution-bus",
    });
  };

  /**
   * Disposes of all event subscriptions for a specific client.
   * @param {string} clientId - The client ID.
   */
  public dispose = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`busService dispose`, {
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
