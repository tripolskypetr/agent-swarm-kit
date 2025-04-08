import {
  AgentName,
  IAgent,
  IAgentSchema,
  IAgentSchemaCallbacks,
} from "./Agent.interface";
import { IBus } from "./Bus.interface";
import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";

export interface IOperatorSchema {
  connectOperator: IAgentSchema["connectOperator"];
}

export interface IOperatorParams
  extends IOperatorSchema,
    IAgentSchemaCallbacks {
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
  bus: IBus;
  history: IHistory;
}

export interface IOperator extends IAgent {}
