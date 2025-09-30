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
  /**
   * Operator connection function to passthrough the chat into operator dashboard.
   * Enables real-time monitoring and control of agent interactions through an external interface.
  */
  connectOperator: IAgentSchemaInternal["connectOperator"];
}

export interface IOperatorParams
  extends IOperatorSchema,
    IAgentSchemaInternalCallbacks {
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
  bus: IBus;
  /**
   * History management service for tracking and storing conversation messages.
   * Provides access to message history for context and logging operations.
  */
  history: IHistory;
}

export interface IOperator extends IAgent {}
