import { IToolCall } from "./Tool.model";

/**
 * Type representing the base roles available for all message types.
 * These are the common roles shared across the swarm system.
 */
export type BaseMessageRole = "assistant" | "system" | "tool" | "user";

/**
 * Base interface representing common properties shared by all message types in the swarm system.
 * Defines the core structure for messages exchanged between agents, tools, users, and the system.
 * Extended by IModelMessage and IOutlineMessage to add specific properties for their respective contexts.
 * @template Role - The type of role for the message, defaults to BaseMessageRole.
 * @interface IBaseMessage
 */
export interface IBaseMessage<Role extends string = BaseMessageRole> {
  /**
   * The role of the message sender.
   * Common roles include "assistant", "system", "tool", and "user".
   * Specific message types may extend this with additional roles.
   */
  role: Role;

  /**
   * The content of the message, representing the primary data or text being communicated.
   * Contains the raw text or data of the message, used in history storage or processing.
   */
  content: string;

  /**
   * Optional array of tool calls associated with the message.
   * Present when the model requests tool execution.
   * Each tool call contains function name, arguments, and a unique identifier.
   */
  tool_calls?: IToolCall[];

  /**
   * Optional array of images associated with the message.
   * Represented as binary data (Blob) or base64 strings.
   * Used for messages involving visual content (e.g., user-uploaded images or tool-generated visuals).
   */
  images?: Blob[] | string[];

  /**
   * Optional identifier of the tool call this message responds to.
   * Links tool outputs to their originating requests.
   * Used to correlate tool responses with their corresponding tool calls.
   */
  tool_call_id?: string;
}
