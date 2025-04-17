import { IToolCall } from "../model/Tool.model";
import { AgentName, TAbortSignal } from "./Agent.interface";
import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";

export type MCPToolValue = { [x: string]: unknown; } | undefined;

export type MCPToolProperties = {
  [key: string]: {
    type: string;
    enum?: string[];
    description?: string;
  };
};

export interface IMCPToolCallDto<T extends MCPToolValue = MCPToolValue> {
    toolId: string;
    clientId: string;
    agentName: AgentName;
    params: T;
    toolCalls: IToolCall[];
    abortSignal: TAbortSignal;
    isLast: boolean;
}

export interface IMCPTool<Properties = MCPToolProperties> {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Properties;
    required?: string[];
  };
}

export interface IMCP {
  listTools(clientId: string): Promise<IMCPTool[]>;
  hasTool(toolName: string, clientId: string): Promise<boolean>;
  callTool<T extends MCPToolValue = MCPToolValue>(toolName: string, dto: IMCPToolCallDto<T>): Promise<void>;
}

export interface IMCPCallbacks {
  onInit(): void;
  onDispose(clientId: string): void;
  onFetch(clientId: string): void;
  onList(clientId: string): void;
  onCall<T extends MCPToolValue = MCPToolValue>(toolName: string, dto: IMCPToolCallDto<T>): void;
}

export interface IMCPSchema {
  mcpName: MCPName;
  docDescription?: string;
  listTools: (clientId: string) => Promise<IMCPTool<unknown>[]>;
  callTool: <T extends MCPToolValue = MCPToolValue>(toolName: string, dto: IMCPToolCallDto<T>) => Promise<void>;
  callbacks?: Partial<IMCPCallbacks>;
}

export interface IMCPParams extends IMCPSchema {
  logger: ILogger;
  bus: IBus;
}

export type MCPName = string;

export default IMCP;
