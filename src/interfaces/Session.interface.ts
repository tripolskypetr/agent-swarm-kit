import { IIncomingMessage, IOutgoingMessage } from "src/model/EmitMessage.model";
import { AgentName, IAgent } from "./Agent.interface";
import { ILogger } from "./Logger.interface";
import ISwarm from "./Swarm.interface";

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
  execute(content: string): Promise<string>;
  connect(connector: SendMessageFn): ReceiveMessageFn;
  commitToolOutput(content: string): Promise<void>;
  commitSystemMessage(message: string): Promise<void>;
}

export type SessionId = string;
