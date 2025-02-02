import IHistory from "../interfaces/History.interface";
import { ILogger } from "../interfaces/Logger.interface";
import { ITool } from "../model/Tool.model";
import {
  CompletionName,
  ICompletion,
} from "../interfaces/Completion.interface";
import { ExecutionMode } from "./Session.interface";

/**
 * Interface representing lifecycle callbacks of a tool
 * @template T - The type of the parameters for the tool.
 */
export interface IAgentToolCallbacks<T = Record<string, unknown>> {
  /**
   * Callback triggered when the tool is called.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves when the tool call is complete.
   */
  onCall?: (clientId: string, agentName: AgentName, params: T) => Promise<void>;
  /**
   * Callback triggered when the tool parameters are validated.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves to a boolean indicating whether the parameters are valid.
   */
  onValidate?: (
    clientId: string,
    agentName: AgentName,
    params: T
  ) => Promise<boolean>;
}

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
  validate(
    clientId: string,
    agentName: AgentName,
    params: T
  ): Promise<boolean> | boolean;
  /** The name of the tool. */
  callbacks?: Partial<IAgentToolCallbacks>;
}

/**
 * Interface representing the parameters for an agent.
 */
export interface IAgentParams
  extends Omit<
      IAgentSchema,
      keyof {
        tools: never;
        completion: never;
        validate: never;
      }
    >,
    IAgentSchemaCallbacks {
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
 * Interface representing the lifecycle callbacks of an agent
 */
export interface IAgentSchemaCallbacks {
  /**
   * Callback triggered when the agent executes.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param input - The input to execute.
   * @param mode - The source of execution: tool or user.
   */
  onExecute?: (
    clientId: string,
    agentName: AgentName,
    input: string,
    mode: ExecutionMode
  ) => void;
  /**
   * Callback triggered when there is tool output.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param content - The content of the tool output.
   */
  onToolOutput?: (
    clientId: string,
    agentName: AgentName,
    content: string
  ) => void;
  /**
   * Callback triggered when there is a system message.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param message - The system message.
   */
  onSystemMessage?: (
    clientId: string,
    agentName: AgentName,
    message: string
  ) => void;
  /**
   * Callback triggered when there is a user message.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param message - The user message.
   */
  onUserMessage?: (
    clientId: string,
    agentName: AgentName,
    message: string
  ) => void;
  /**
   * Callback triggered when the agent history is flushed.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   */
  onFlush?: (clientId: string, agentName: AgentName) => void;
  /**
   * Callback triggered when there is output.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param output - The output string.
   */
  onOutput?: (clientId: string, agentName: AgentName, output: string) => void;
  /**
   * Callback triggered when the agent is resurrected.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param mode - The source of execution: tool or user.
   * @param reason - The reason for the resurrection.
   */
  onResurrect?: (
    clientId: string,
    agentName: AgentName,
    mode: ExecutionMode,
    reason?: string
  ) => void;
  /**
   * Callback triggered when agent is initialized
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   */
  onInit?: (clientId: string, agentName: AgentName) => void;
  /**
   * Callback triggered when agent is disposed
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   */
  onDispose?: (clientId: string, agentName: AgentName) => void;
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
  /** The system prompt. Usually used for tool calling protocol. */
  system?: string[];
  /** The names of the tools used by the agent. */
  tools?: ToolName[];
  /**
   * Validates the output.
   * @param output - The output to validate.
   * @returns A promise that resolves to a string or null.
   */
  validate?: (output: string) => Promise<string | null>;
  /** The lifecycle calbacks of the agent. */
  callbacks?: Partial<IAgentSchemaCallbacks>;
}

/**
 * Interface representing an agent.
 */
export interface IAgent {
  /**
   * Executes the agent with the given input.
   * @param input - The input to execute.
   * @param mode - The source of execution: tool or user.
   * @returns A promise that resolves when the execution is complete.
   */
  execute: (input: string, mode: ExecutionMode) => Promise<void>;
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
  /**
   * Commits a user message without answer.
   * @param message - The message to commit.
   * @returns A promise that resolves when the message is committed.
   */
  commitUserMessage(message: string): Promise<void>;
  /**
   * Clears the history for the agent.
   * @returns A promise that resolves when the flush is committed.
   */
  commitFlush(): Promise<void>;
}

/** Type representing the name of an agent. */
export type AgentName = string;

/** Type representing the name of a tool. */
export type ToolName = string;
