import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";
import { ITool } from "../model/Tool.model";
import { ICompletion } from "./Completion.interface";

export interface IAgentTool<T = Record<string, unknown>> {
  call(agentName: AgentName, params: T): Promise<void>;
  validate(agentName: AgentName, params: T): Promise<boolean> | boolean;
  getToolSignature(): IAgentToolSignature<T>;
}

export interface IAgentToolSignature<T = Record<string, unknown>>
  extends ITool,
    Omit<
      IAgentTool<T>,
      keyof {
        call: never;
        getToolSignature: never;
      }
    > {
  implementation(agentName: AgentName, params: T): Promise<void>;
}

export interface IAgentParams extends Omit<IAgentSpec, keyof {
  tools: never;
  completion: never;
  validate: never;
}> {
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
  history: IHistory;
  completion: ICompletion;
  tools?: IAgentToolSignature[];
  validate: (output: string) => Promise<string | null>;
}

export interface IAgentSpec {
  completion: string;
  prompt: string;
  tools?: string[];
  validate?: (output: string) => Promise<string | null>;
}

export interface IAgent {
  execute: (input: string) => Promise<void>;
  waitForOutput: () => Promise<string>;
  commitToolOutput(content: string): Promise<void>;
  commitSystemMessage(message: string): Promise<void>;
}

export type AgentName = string;
