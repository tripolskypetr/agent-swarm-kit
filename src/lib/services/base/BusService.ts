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

/**
 * Service class implementing the IBus interface to manage event subscriptions and emissions in the swarm system.
 * Provides methods to subscribe to events (subscribe, once), emit events (emit, commitExecutionBegin, commitExecutionEnd), and dispose of subscriptions (dispose), using a memoized Subject per clientId and EventSource.
 * Integrates with ClientAgent (e.g., execution events in EXECUTE_FN), PerfService (e.g., execution tracking via emit), and DocService (e.g., performance logging), leveraging LoggerService for info-level logging and SessionValidationService for session validation.
 * Supports wildcard subscriptions (clientId="*") and execution-specific event aliases, enhancing event-driven communication across the system.
*/
export class BusService implements IBus {
  /**
   * Logger service instance, injected via DI, for logging bus operations.
   * Used in methods like subscribe, emit, and dispose when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with PerfService and DocService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Session validation service instance, injected via DI, for checking active client sessions.
   * Used in emit to ensure events are only emitted for valid sessions, aligning with ClientAgent’s session management (e.g., clientId validation).
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Set of registered event sources, tracking all unique EventSource values from subscriptions.
   * Used in dispose to clean up subscriptions for a clientId, ensuring comprehensive resource management.
   * @private
   */
  private _eventSourceSet = new Set<EventSource>();

  /**
   * Map indicating wildcard subscriptions (clientId="*") for each EventSource.
   * Used in emit to broadcast events to wildcard subscribers, enhancing flexibility in event handling (e.g., system-wide monitoring).
   * @private
   */
  private _eventWildcardMap = new Map<EventSource, boolean>();

  /**
   * Memoized factory function to create or retrieve a Subject for a clientId and EventSource pair.
   * Uses memoize from functools-kit with a key of `${clientId}-${source}`, optimizing performance by reusing Subjects, integral to subscribe, once, and emit operations.
   * @private
   */
  private getEventSubject = memoize<
    (clientId: string, source: EventSource) => Subject<IBaseEvent>
  >(
    ([clientId, source]) => `${clientId}-${source}`,
    () => new Subject()
  );

  /**
   * Subscribes to events for a specific client and event source, invoking the callback for each matching event.
   * Registers the source in _eventSourceSet and supports wildcard subscriptions (clientId="*") via _eventWildcardMap, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., to monitor execution events) and PerfService (e.g., to track execution metrics indirectly via events).
   * @template T - The event type extending IBaseEvent.
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
   * Subscribes to a single event for a specific client and event source, invoking the callback once when the filter condition is met.
   * Registers the source in _eventSourceSet and supports wildcard subscriptions, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Useful for one-time event handling (e.g., ClientAgent awaiting execution completion), complementing subscribe.
   * @template T - The event type extending IBaseEvent.
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
   * Emits an event for a specific client, broadcasting to subscribers of the event’s source, including wildcard subscribers.
   * Validates the client session with SessionValidationService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, and supports PerfService execution tracking (e.g., via commitExecutionBegin).
   * @template T - The event type extending IBaseEvent.
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
   * Emits an execution begin event for a specific client, serving as an alias for emit with a predefined IBusEvent structure.
   * Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in ClientAgent (e.g., EXECUTE_FN start) and PerfService (e.g., startExecution trigger).
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
   * Emits an execution end event for a specific client, serving as an alias for emit with a predefined IBusEvent structure.
   * Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in ClientAgent (e.g., EXECUTE_FN completion) and PerfService (e.g., endExecution trigger).
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
   * Disposes of all event subscriptions for a specific client, unsubscribing and clearing Subjects for all registered sources.
   * Logs via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with PerfService’s dispose (e.g., session cleanup) and ClientAgent’s session termination.
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

/**
 * Default export of the BusService class.
 * Provides the primary event bus interface for the swarm system, facilitating event-driven communication across ClientAgent, PerfService, and DocService.
*/
export default BusService;
