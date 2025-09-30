import IHistory from "../interfaces/History.interface";
import { ILogger } from "../interfaces/Logger.interface";
import { ITool, IToolCall, IToolRequest } from "../model/Tool.model";
import {
  CompletionName,
  ICompletion,
} from "../interfaces/Completion.interface";
import { ExecutionMode } from "./Session.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { StorageName } from "./Storage.interface";
import { StateName } from "./State.interface";
import { IBus } from "./Bus.interface";
import { WikiName } from "./Wiki.interface";
import IMCP, { MCPName } from "./MCP.interface";

/**
 * The dispose function type, representing a function that performs cleanup or resource release.
*/
type DisposeFn = () => void;

/**
 * Interface extending the standard `AbortSignal` to represent a typed abort signal.
 * Used for signaling and managing the cancellation of asynchronous operations.
 * 
 * This interface can be extended or customized to include additional properties or methods
 * specific to the application's requirements.
 * 
 * @extends {AbortSignal}
*/
export interface TAbortSignal extends AbortSignal { }

/**
 * Type representing possible values for tool parameters.
 * Supports basic data types for flexible parameter passing.
*/
export type ToolValue = string | number | boolean | null;

/**
 * Interface representing lifecycle callbacks for an agent tool.
 * Provides hooks for pre- and post-execution, validation, and error handling.
 * @template T - The type of the parameters for the tool, defaults to a record of ToolValue.
*/
export interface IAgentToolCallbacks<T = Record<string, ToolValue>> {
  /**
   * Optional callback triggered before the tool is executed.
   * Useful for logging, pre-processing, or setup tasks.
  */
  onBeforeCall?: (
    toolId: string,
    clientId: string,
    agentName: AgentName,
    params: T
  ) => Promise<void>;

  /**
   * Optional callback triggered after the tool is executed.
   * Useful for cleanup, logging, or post-processing.
  */
  onAfterCall?: (
    toolId: string,
    clientId: string,
    agentName: AgentName,
    params: T
  ) => Promise<void>;

  /**
   * Optional callback triggered to validate tool parameters before execution.
   * Allows custom validation logic specific to the tool.
  */
  onValidate?: (
    clientId: string,
    agentName: AgentName,
    params: T
  ) => Promise<boolean>;

  /**
   * Optional callback triggered when the tool execution fails.
   * Useful for error logging or recovery actions.
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
 * Interface representing a tool used by an agent, extending the base ITool interface.
 * Defines the tool's execution and validation logic, with optional lifecycle callbacks.
 * @template T - The type of the parameters for the tool, defaults to a record of ToolValue.
 * @extends {ITool}
*/
export interface IAgentTool<T = Record<string, ToolValue>> {
  /** Optional description for documentation purposes, aiding in tool usage understanding.*/
  docNote?: string;

  /** The unique name of the tool, used for identification within the agent swarm.*/
  toolName: ToolName;

  /**
   * Executes the tool with the specified parameters and context.
   * @throws {Error} If the tool execution fails or parameters are invalid.
  */
  call(dto: {
    toolId: string;
    clientId: string;
    agentName: AgentName;
    toolName: ToolName;
    params: T;
    toolCalls: IToolCall[];
    abortSignal: TAbortSignal;
    callReason: string;
    isLast: boolean;
  }): Promise<void>;

  /**
   * Checks if the tool is available for execution.
   * This method can be used to determine if the tool can be executed based on the current context.
  */
  isAvailable?: (
    clientId: string,
    agentName: AgentName,
    toolName: ToolName,
  ) => (boolean | Promise<boolean>);

  /**
   * Validates the tool parameters before execution.
   * Can return synchronously or asynchronously based on validation complexity.
  */
  validate?: (dto: {
    clientId: string;
    agentName: AgentName;
    toolCalls: IToolCall[];
    params: T;
  }) => Promise<boolean> | boolean;

  /** Optional lifecycle callbacks for the tool, allowing customization of execution flow.*/
  callbacks?: Partial<IAgentToolCallbacks>;

  /** Tool type defenition. For now, should be `function`*/
  type: ITool['type'];

  /** Optional dynamic factory to resolve tool metadata*/
  function: ITool['function'] | ((clientId: string, agentName: AgentName) => (ITool['function'] | Promise<ITool['function']>));
}

/**
 * Interface representing the runtime parameters for an agent.
 * Combines schema properties (excluding certain fields) with callbacks and runtime dependencies.
 * @extends {Omit<IAgentSchemaInternal, "tools" | "completion" | "validate">}
 * @extends {IAgentSchemaInternalCallbacks}
*/
export interface IAgentParams
  extends Omit<
    IAgentSchemaInternal,
    keyof {
      system: never;
      tools: never;
      mcp: never;
      completion: never;
      validate: never;
    }
  >,
  IAgentSchemaInternalCallbacks {
  /** The ID of the client interacting with the agent.*/
  clientId: string;

  /** The logger instance for recording agent activity and errors.*/
  logger: ILogger;

  /** The bus instance for event communication within the swarm.*/
  bus: IBus;

  /** The mcp instance for external tool call*/
  mcp: IMCP;

  /** The history instance for tracking agent interactions.*/
  history: IHistory;

  /** The completion instance for generating responses or outputs.*/
  completion: ICompletion;

  /** Optional array of tools available to the agent for execution.*/
  tools?: IAgentTool[];

  /**
   * Validates the agent's output before finalization.
  */
  validate: (output: string) => Promise<string | null>;
}

/**
 * Interface representing lifecycle callbacks for an agent.
 * Provides hooks for various stages of agent execution and interaction.
*/
export interface IAgentSchemaInternalCallbacks {
  /**
   * Optional callback triggered when the agent runs statelessly (without history updates).
  */
  onRun?: (clientId: string, agentName: AgentName, input: string) => void;

  /**
   * Optional callback triggered when the agent begins execution.
  */
  onExecute?: (
    clientId: string,
    agentName: AgentName,
    input: string,
    mode: ExecutionMode
  ) => void;

  /**
   * Optional callback triggered when a tool produces output.
  */
  onToolOutput?: (
    toolId: string,
    clientId: string,
    agentName: AgentName,
    content: string
  ) => void;

  /**
   * Optional callback triggered when a system message is generated.
  */
  onSystemMessage?: (
    clientId: string,
    agentName: AgentName,
    message: string
  ) => void;

  /**
   * Optional callback triggered when a developer message is generated.
  */
  onDeveloperMessage?: (
    clientId: string,
    agentName: AgentName,
    message: string
  ) => void;

  /**
   * Optional callback triggered when a tool request is initiated.
   * This callback is used to handle or process tool requests made by the agent.
   * 
  */
  onToolRequest?: (
    clientId: string,
    agentName: AgentName,
    request: IToolRequest[]
  ) => void;

  /**
   * Optional callback triggered when a tool throw an error
   * This callback is used to log the error before resurrect
   * 
  */
  onToolError?: (
    clientId: string,
    agentName: AgentName,
    toolName: ToolName,
    error: Error,
  ) => void;

  /**
   * Optional callback triggered when an assistant message is committed.
  */
  onAssistantMessage?: (
    clientId: string,
    agentName: AgentName,
    message: string
  ) => void;

  /**
   * Optional callback triggered when a user message is received.
  */
  onUserMessage?: (
    clientId: string,
    agentName: AgentName,
    message: string
  ) => void;

  /**
   * Optional callback triggered when the agent's history is flushed.
  */
  onFlush?: (clientId: string, agentName: AgentName) => void;

  /**
   * Optional callback triggered when the agent produces output.
   * W
  */
  onOutput?: (clientId: string, agentName: AgentName, output: string) => void;

  /**
   * Optional callback triggered when the agent is resurrected after a pause or failure.
  */
  onResurrect?: (
    clientId: string,
    agentName: AgentName,
    mode: ExecutionMode,
    reason?: string
  ) => void;

  /**
   * Optional callback triggered when the agent is initialized.
  */
  onInit?: (clientId: string, agentName: AgentName) => void;

  /**
   * Optional callback triggered when the agent is disposed of.
  */
  onDispose?: (clientId: string, agentName: AgentName) => void;

  /**
   * Optional callback triggered after all tool calls in a sequence are completed.
  */
  onAfterToolCalls?: (
    clientId: string,
    agentName: AgentName,
    toolCalls: IToolCall[]
  ) => void;
}

/**
 * Interface representing the configuration schema for an agent.
 * Defines the agent's properties, tools, and lifecycle behavior.
*/
export interface IAgentSchemaInternal {
  /**
   * Optional function to filter or modify tool calls before execution.
  */
  mapToolCalls?: (
    tool: IToolCall[],
    clientId: string,
    agentName: AgentName
  ) => IToolCall[] | Promise<IToolCall[]>;

  /** Optional maximum number of tool calls allowed per completion cycle.*/
  maxToolCalls?: number;

  /** Optional maximum number of messages to maintain context size*/
  keepMessages?: number;

  /** Optional description for documentation purposes, aiding in agent usage understanding.*/
  docDescription?: string;

  /** The unique name of the agent within the swarm.*/
  agentName: AgentName;

  /** Flag means the operator is going to chat with customer on another side*/
  operator?: boolean;

  /** The name of the completion mechanism used by the agent. REQUIRED WHEN AGENT IS NOT OPERATOR*/
  completion?: CompletionName;

  /** The primary prompt guiding the agent's behavior. REQUIRED WHEN AGENT IS NOT OPERATOR*/
  prompt?: string | ((clientId: string, agentName: AgentName) => (Promise<string> | string));

  /** Optional array of system prompts, typically used for tool-calling protocols.*/
  system?: string[];

  /** Optional array of system prompts, alias for `system`*/
  systemStatic?: string[];

  /** Optional dynamic array of system prompts from the callback*/
  systemDynamic?: (clientId: string, agentName: AgentName) => (Promise<string[]> | string[]);

  /** Operator connection function to passthrough the chat into operator dashboard*/
  connectOperator?: (clientId: string, agentName: AgentName) => (message: string, next: (answer: string) => void) => DisposeFn,

  /** Optional array of tool names available to the agent.*/
  tools?: ToolName[];

  /** Optional array of storage names utilized by the agent.*/
  storages?: StorageName[];

  /** Optional array of wiki names utilized by the agent.*/
  wikiList?: WikiName[];

  /** Optional array of state names managed by the agent.*/
  states?: StateName[];

  /** Optional array of mcp names managed by the agent*/
  mcp?: MCPName[];

  /** Optional array of agent names this agent depends on for transitions (e.g., via changeToAgent).*/
  dependsOn?: AgentName[];

  /**
   * Optional function to validate the agent's output before finalization.
  */
  validate?: (output: string) => Promise<string | null>;

  /**
   * Optional function to transform the model's output before further processing.
  */
  transform?: (
    input: string,
    clientId: string,
    agentName: AgentName
  ) => Promise<string> | string;

  /**
   * Optional function to map assistant messages, e.g., converting JSON to tool calls for specific models.
  */
  map?: (
    message: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => Promise<IModelMessage> | IModelMessage;

  /** Optional lifecycle callbacks for the agent, allowing customization of execution flow.*/
  callbacks?: Partial<IAgentSchemaInternalCallbacks>;
}

export interface IAgentSchema extends Omit<IAgentSchemaInternal, keyof {
  system: never;
  systemStatic: never;
  systemDynamic: never;
}> {
  /** Optional array of system prompts, typically used for tool-calling protocols.*/
  system?: string | string[];

  /** Optional array of system prompts, alias for `system`*/
  systemStatic?: string | string[];

  /** Optional dynamic array of system prompts from the callback*/
  systemDynamic?: (clientId: string, agentName: AgentName) => (Promise<string | string[]> | string[] | string);

}

/**
 * Interface representing an agent's runtime behavior and interaction methods.
 * Defines how the agent processes inputs, commits messages, and manages its lifecycle.
*/
export interface IAgent {
  /**
   * Runs the agent statelessly without modifying chat history.
   * Useful for one-off computations or previews.
   * @throws {Error} If execution fails due to invalid input or internal errors.
  */
  run: (input: string) => Promise<string>;

  /**
   * Executes the agent with the given input, potentially updating history based on mode.
   * @throws {Error} If execution fails due to invalid input, tools, or internal errors.
  */
  execute: (input: string, mode: ExecutionMode) => Promise<void>;

  /**
   * Waits for and retrieves the agent's output after execution.
   * @throws {Error} If no output is available or waiting times out.
  */
  waitForOutput: () => Promise<string>;

  /**
   * Commits tool output to the agent's history or state.
   * @throws {Error} If the tool ID is invalid or committing fails.
  */
  commitToolOutput(toolId: string, content: string): Promise<void>;

  /**
   * Commits a system message to the agent's history or state.
   * @throws {Error} If committing the message fails.
  */
  commitSystemMessage(message: string): Promise<void>;

  /**
   * Commits a developer message to the agent's history or state.
   * @throws {Error} If committing the message fails.
  */
  commitDeveloperMessage(message: string): Promise<void>;

  /**
   * Commits a user message to the agent's history without triggering a response.
   * @throws {Error} If committing the message fails.
  */
  commitUserMessage(message: string, mode: ExecutionMode): Promise<void>;

  /**
   * Commits a tool request to the agent's history or state.
   * This method is used to log or process tool requests, which can be a single request or an array of requests.
   * 
   * @throws {Error} If committing the tool request(s) fails.
  */
  commitToolRequest(request: IToolRequest[]): Promise<string[]>;

  /**
   * Commits an assistant message to the agent's history without triggering a response.
   * @throws {Error} If committing the message fails.
  */
  commitAssistantMessage(message: string): Promise<void>;

  /**
   * Clears the agent's history, resetting it to an initial state.
   * @throws {Error} If flushing the history fails.
  */
  commitFlush(): Promise<void>;

  /**
   * Prevents the next tool in the execution sequence from running and stops further tool calls.
   * @throws {Error} If stopping the tools fails.
  */
  commitStopTools(): Promise<void>;

  /**
   * Unlocks the execution queue and signals an agent change, stopping subsequent tool executions.
   * @throws {Error} If committing the agent change fails.
  */
  commitAgentChange(): Promise<void>;

  /**
   * Unlocks the execution queue and signals an agent output cancelation, stopping subsequent tool executions.
   * @throws {Error} If committing the agent change fails.
  */
  commitCancelOutput(): Promise<void>;
}

/**
 * Type representing the unique name of an agent within the swarm.
 * Used to identify and reference specific agent instances.
*/
export type AgentName = string;

/**
 * Type representing the unique name of a tool within the swarm.
 * Used to identify and reference specific tool implementations.
*/
export type ToolName = string;
