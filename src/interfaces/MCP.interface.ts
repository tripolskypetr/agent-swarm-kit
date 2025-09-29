import { IToolCall } from "../model/Tool.model";
import { AgentName, TAbortSignal, ToolName } from "./Agent.interface";
import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";

/**
 * Type representing the value of an MCP tool's parameters, which can be an object with string keys or undefined.
 */
export type MCPToolValue = { [x: string]: unknown } | undefined;

/**
 * When MCP tool return string it will automatically commit to the agent
 */
export type MCPToolOutput = string | undefined | void;

/**
 * Type representing the properties of an MCP tool's input schema.
 */
export type MCPToolProperties = {
  [key: string]: {
    type: string;
    enum?: string[];
    description?: string;
  };
};

/**
 * Interface for the data transfer object used in MCP tool calls.
 */
export interface IMCPToolCallDto<T extends MCPToolValue = MCPToolValue> {
  /** Unique identifier for the tool. */
  toolId: string;
  /** Identifier for the client making the tool call. */
  clientId: string;
  /** Name of the agent associated with the tool call. */
  agentName: AgentName;
  /** Name of the tool associated with the tool call */
  toolName: ToolName;
  /** Parameters for the tool call. */
  params: T;
  /** Array of tool calls associated with this request. */
  toolCalls: IToolCall[];
  /** Signal to abort the tool call operation. */
  abortSignal: TAbortSignal;
  /** Indicates if this is the last tool call in a sequence. */
  isLast: boolean;
}

/**
 * Interface for an MCP tool, defining its name, description, and input schema.
 */
export interface IMCPTool<Properties = MCPToolProperties> {
  /** Name of the tool. */
  name: string;
  /** Optional description of the tool. */
  description?: string;
  /** Schema defining the input structure for the tool. */
  inputSchema: {
    type: "object";
    properties?: Properties;
    required?: string[];
  };
}

/**
 * Interface for Model Context Protocol (MCP) operations.
 */
export interface IMCP {
  /**
   * Lists available tools for a given client.
   */
  listTools(clientId: string): Promise<IMCPTool[]>;

  /**
   * Checks if a specific tool exists for a given client.
   */
  hasTool(toolName: string, clientId: string): Promise<boolean>;

  /**
   * Calls a specific tool with the provided parameters.
   */
  callTool<T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<MCPToolOutput>;

  /**
   * Updates the list of tools by clearing the cache and invoking the update callback.
   */
  updateToolsForAll(): Promise<void>;

  /**
   * Updates the list of tools by clearing the cache and invoking the update callback.
   */
  updateToolsForClient(clientId: string): Promise<void>;
}

/**
 * Interface for MCP callback functions triggered during various lifecycle events.
 */
export interface IMCPCallbacks {
  /** Called when the MCP is initialized. */
  onInit(): void;

  /**
   * Called when the MCP resources for a client are disposed.
   */
  onDispose(clientId: string): void;

  /**
   * Called when tools are fetched for a client.
   */
  onFetch(clientId: string): void;

  /**
   * Called when listing tools for a client.
   */
  onList(clientId: string): void;

  /**
   * Called when a tool is invoked.
   */
  onCall<T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): void;

  /**
   * Called when the list of tools is updated.
   */
  onUpdate(mcpName: MCPName, clientId: string | undefined): void;
}

/**
 * Interface for the MCP schema, defining the structure and behavior of an MCP.
 */
export interface IMCPSchema {
  /** Unique name of the MCP. */
  mcpName: MCPName;
  /** Optional description of the MCP for documentation. */
  docDescription?: string;

  /**
   * Function to list available tools for a client.
   */
  listTools: (clientId: string) => Promise<IMCPTool<unknown>[]>;

  /**
   * Function to call a specific tool with the provided parameters.
   */
  callTool: <T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ) => Promise<MCPToolOutput>;

  /** Optional callbacks for MCP lifecycle events. */
  callbacks?: Partial<IMCPCallbacks>;
}

/**
 * Interface for MCP parameters, extending the MCP schema with additional dependencies.
 */
export interface IMCPParams extends IMCPSchema {
  /** Logger instance for logging MCP operations. */
  logger: ILogger;
  /** Bus instance for communication or event handling. */
  bus: IBus;
}

/**
 * Type representing the name of an MCP.
 */
export type MCPName = string;

export default IMCP;
