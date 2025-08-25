import { Subject } from "functools-kit";
import { SessionId } from "../interfaces/Session.interface";

export const disposeSubject = new Subject<SessionId>();

export const errorSubject = new Subject<[SessionId, Error]>();
