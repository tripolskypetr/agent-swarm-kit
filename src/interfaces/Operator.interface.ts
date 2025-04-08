import { AgentName, IAgent, IAgentSchema } from "./Agent.interface";
import { IBus } from "./Bus.interface";
import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";

export interface IOperatorSchema {
    connectOperator: IAgentSchema['connectOperator'];
}

export interface IOperatorParams extends IOperatorSchema {
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
  bus: IBus;
  history: IHistory;
}

export interface IOperator extends IAgent {}
