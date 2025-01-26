import { IIncomingMessage, IOutgoingMessage } from "../model/EmitMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import ISwarm from "../interfaces/Swarm.interface";

export interface ISessionParams extends ISessionSchema {
  clientId: string;
  logger: ILogger;
  swarm: ISwarm;
}

export interface ISessionSchema {
}

export type SendMessageFn = (outgoing: IOutgoingMessage) => Promise<void> | void;
export type ReceiveMessageFn = (incoming: IIncomingMessage) => Promise<void> | void;

export interface ISession {
  emit(message: string): Promise<void>
  execute(content: string): Promise<string>;
  connect(connector: SendMessageFn): ReceiveMessageFn;
  commitToolOutput(content: string): Promise<void>;
  commitSystemMessage(message: string): Promise<void>;
}

export type SessionId = string;

export type SessionMode = "session" | "makeConnection" | "complete";
