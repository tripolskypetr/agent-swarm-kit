import IHistory from "../interfaces/History.interface";
import { ILogger } from "../interfaces/Logger.interface";
import { ITool, IToolCall } from "../model/Tool.model";
import {
  CompletionName,
  ICompletion,
} from "../interfaces/Completion.interface";
import { ExecutionMode } from "./Session.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { StorageName } from "./Storage.interface";
import { StateName } from "./State.interface";

/**
 * Interface representing lifecycle callbacks of a tool
 * @template T - The type of the parameters for the tool.
 */
export interface IAgentToolCallbacks<T = Record<string, unknown>> {
  /**
   * Callback triggered before the tool is called.
   * @param toolId - The `tool_call_id` for openai history
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves when the tool call is complete.
   */
  onBeforeCall?: (
    toolId: string,
    clientId: string,
    agentName: AgentName,
    params: T
  ) => Promise<void>;
  /**
   * Callback triggered after the tool is called.
   * @param toolId - The `tool_call_id` for openai history
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves when the tool call is complete.
   */
  onAfterCall?: (
    toolId: string,
    clientId: string,
    agentName: AgentName,
    params: T
  ) => Promise<void>;
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
  /**
   * Callback triggered when the tool fails to execute
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves to a boolean indicating whether the parameters are valid.
   */
  onCallError?: (
    toolId: string,
    clientId: string,
    agentName: AgentName,
    params: T,
    error: Error
  ) => Promise<void>;
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
   * @param toolId - The `tool_call_id` for openai history
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves when the tool call is complete.
   */
  call(dto: {
    toolId: string;
    clientId: string;
    agentName: AgentName;
    params: T;
    toolCalls: IToolCall[],
    isLast: boolean;
  }): Promise<void>;
  /**
   * Validates the parameters for the tool.
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param params - The parameters for the tool.
   * @returns A promise that resolves to a boolean indicating whether the parameters are valid, or a boolean.
   */
  validate(dto: {
    clientId: string;
    agentName: AgentName;
    toolCalls: IToolCall[],
    params: T;
  }): Promise<boolean> | boolean;
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
   * @param toolId - The `tool_call_id` for openai history
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param content - The content of the tool output.
   */
  onToolOutput?: (
    toolId: string,
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
  /**
   * Callback triggered after all tools are called
   * @param clientId - The ID of the client.
   * @param agentName - The name of the agent.
   * @param toolCalls - The array of tool calls
   */
  onAfterToolCalls?: (
    clientId: string,
    agentName: AgentName,
    toolCalls: IToolCall[]
  ) => void;
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
  /** The names of the storages used by the agent. */
  storages?: StorageName[];
  /** The names of the states used by the agent. */
  states?: StateName[];
  /**
   * Validates the output.
   * @param output - The output to validate.
   * @returns A promise that resolves to a string or null.
   */
  validate?: (output: string) => Promise<string | null>;
  /** The transform function for model output */
  transform?: (
    input: string,
    clientId: string,
    agentName: AgentName
  ) => Promise<string> | string;
  /** The map function for assistant messages. Use to transform json to tool_call for deepseek r1 on ollama*/
  map?: (
    message: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => Promise<IModelMessage> | IModelMessage;
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
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param content - The content of the tool output.
   * @returns A promise that resolves when the tool output is committed.
   */
  commitToolOutput(toolId: string, content: string): Promise<void>;
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
  /**
   * Unlock the queue on agent change. Stop the next tool execution
   * @returns A promise that resolves when the agent change is committed.
   */
  commitAgentChange(): Promise<void>;
}

/** Type representing the name of an agent. */
export type AgentName = string;

/** Type representing the name of a tool. */
export type ToolName = string;
