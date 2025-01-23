import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";
import { ITool } from "../model/Tool.model";
import { CompletionName, ICompletion } from "./Completion.interface";

export interface IAgentTool<T = Record<string, unknown>> extends ITool {
  call(clientId: string, agentName: AgentName, params: T): Promise<void>;
  validate(clientId: string, agentName: AgentName, params: T): Promise<boolean> | boolean;
}

export interface IAgentParams extends Omit<IAgentSchema, keyof {
  tools: never;
  completion: never;
  validate: never;
}> {
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
  history: IHistory;
  completion: ICompletion;
  tools?: IAgentTool[];
  validate: (output: string) => Promise<string | null>;
}

export interface IAgentSchema {
  completion: CompletionName;
  prompt: string;
  tools?: ToolName[];
  validate?: (output: string) => Promise<string | null>;
}

export interface IAgent {
  execute: (input: string) => Promise<void>;
  waitForOutput: () => Promise<string>;
  commitToolOutput(content: string): Promise<void>;
  commitSystemMessage(message: string): Promise<void>;
}

export type AgentName = string;

export type ToolName = string;
