import { memoize, Subject } from "functools-kit";
import { inject } from "../../../lib/core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../../lib/core/types";
import { IBus } from "../../../interfaces/Bus.interface";
import IBaseEvent, { EventSource } from "../../../model/Event.model";

const EVENT_SOURCE_LIST: EventSource[] = [
  "agent",
  "history",
  "session",
  "state",
  "storage",
  "swarm",
];

export class BusService implements IBus {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private getEventSubject = memoize<
    (clientId: string, source: EventSource) => Subject<IBaseEvent>
  >(
    ([clientId, source]) => `${clientId}-${source}`,
    () => new Subject()
  );

  public subscribe = <T extends IBaseEvent>(
    clientId: string,
    source: EventSource,
    fn: (event: T) => void
  ) => {
    this.loggerService.log(`busService subscribe`, {
      clientId,
    });
    return this.getEventSubject(clientId, source).subscribe(fn);
  };

  public once = <T extends IBaseEvent>(
    clientId: string,
    source: EventSource,
    filterFn: (event: T) => boolean,
    fn: (event: T) => void
  ) => {
    this.loggerService.log(`busService once`, {
      clientId,
    });
    return this.getEventSubject(clientId, source).filter(filterFn).once(fn);
  };

  public emit = async <T extends IBaseEvent>(clientId: string, event: T) => {
    this.loggerService.log(`busService emit`, {
      clientId,
      event,
    });
    if (!this.getEventSubject.has(`${clientId}-${event.source}`)) {
      return;
    }
    await this.getEventSubject(clientId, event.source).next(event);
  };

  public dispose = (clientId: string) => {
    this.loggerService.log(`busService dispose`, {
      clientId,
    });
    for (const source of EVENT_SOURCE_LIST) {
      const key = `${clientId}-${source}`;
      if (this.getEventSubject.has(key)) {
        this.getEventSubject(clientId, source).unsubscribeAll();
      }
      this.getEventSubject.clear(`${clientId}-${source}`);
    }
  };
}

export default BusService;
