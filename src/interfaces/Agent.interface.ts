import IHistory from "../interfaces/History.interface";
import { ILogger } from "../interfaces/Logger.interface";
import { ITool } from "../model/Tool.model";
import { CompletionName, ICompletion } from "../interfaces/Completion.interface";

/**
 * Interface representing a tool used by an agent.
 * @template T - The type of the parameters for the tool.
 */
export interface IAgentTool<T = Record<string, unknown>> extends ITool {
  /** The name of the tool. */
  toolName: ToolName;
  /**
   * Calls the tool with the specified parameters.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves when the tool call is complete.
   */
  call(clientId: string, agentName: AgentName, params: T): Promise<void>;
  /**
   * Validates the parameters for the tool.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves to a boolean indicating whether the parameters are valid, or a boolean.
   */
  validate(clientId: string, agentName: AgentName, params: T): Promise<boolean> | boolean;
}

/**
 * Interface representing the parameters for an agent.
 */
export interface IAgentParams extends Omit<IAgentSchema, keyof {
  tools: never;
  completion: never;
  validate: never;
}> {
  /** The ID of the client. */
  clientId: string;
  /** The logger instance. */
  logger: ILogger;
  /** The history instance. */
  history: IHistory;
  /** The completion instance. */
  completion: ICompletion;
  /** The tools used by the agent. */
  tools?: IAgentTool[];
  /**
   * Validates the output.
   * @param output - The output to validate.
   * @returns A promise that resolves to a string or null.
   */
  validate: (output: string) => Promise<string | null>;
}

/**
 * Interface representing the schema for an agent.
 */
export interface IAgentSchema {
  /** The name of the agent. */
  agentName: AgentName;
  /** The name of the completion. */
  completion: CompletionName;
  /** The prompt for the agent. */
  prompt: string;
  /** The names of the tools used by the agent. */
  tools?: ToolName[];
  /**
   * Validates the output.
   * @param output - The output to validate.
   * @returns A promise that resolves to a string or null.
   */
  validate?: (output: string) => Promise<string | null>;
}

/**
 * Interface representing an agent.
 */
export interface IAgent {
  /**
   * Executes the agent with the given input.
   * @param input - The input to execute.
   * @returns A promise that resolves when the execution is complete.
   */
  execute: (input: string) => Promise<void>;
  /**
   * Waits for the output from the agent.
   * @returns A promise that resolves to the output string.
   */
  waitForOutput: () => Promise<string>;
  /**
   * Commits the tool output.
   * @param content - The content of the tool output.
   * @returns A promise that resolves when the tool output is committed.
   */
  commitToolOutput(content: string): Promise<void>;
  /**
   * Commits a system message.
   * @param message - The system message to commit.
   * @returns A promise that resolves when the system message is committed.
   */
  commitSystemMessage(message: string): Promise<void>;
}

/** Type representing the name of an agent. */
export type AgentName = string;

/** Type representing the name of a tool. */
export type ToolName = string;
