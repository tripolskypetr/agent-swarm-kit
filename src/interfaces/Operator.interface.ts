import {
  AgentName,
  IAgent,
  IAgentSchemaInternal,
  IAgentSchemaInternalCallbacks,
} from "./Agent.interface";
import { IBus } from "./Bus.interface";
import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";

export interface IOperatorSchema {
  connectOperator: IAgentSchemaInternal["connectOperator"];
}

export interface IOperatorParams
  extends IOperatorSchema,
    IAgentSchemaInternalCallbacks {
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
  bus: IBus;
  history: IHistory;
}

export interface IOperator extends IAgent {}
