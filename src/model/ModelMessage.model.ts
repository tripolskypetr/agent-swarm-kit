import { ExecutionMode } from "../interfaces/Session.interface";
import { IToolCall } from "./Tool.model";

/**
 * Interface representing a model message.
 */
export interface IModelMessage {
  /**
   * The role of the message sender.
   * @type {'assistant' | 'system' | 'tool' | 'user' | 'resque' | 'flush'}
   */
  role: "assistant" | "system" | "tool" | "user" | "resque" | "flush";

  /**
   * The name of the agent sending the message.
   * @type {string}
   */
  agentName: string;

  /**
   * The content of the message.
   * @type {string}
   */
  content: string;

  /**
   * The source of message: tool or user
   * @type {ExecutionMode}
   */
  mode: ExecutionMode;

  /**
   * Optional tool calls associated with the message.
   * @type {Array<{ function: { name: string; arguments: { [key: string]: any; }; }; }>}
   */
  tool_calls?: IToolCall[];

  /**
   * Tool call that this message is responding to.
   */
  tool_call_id?: string;
}
