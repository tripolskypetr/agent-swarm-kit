import { BaseMessageRole, IBaseMessage } from "./BaseMessage.contract";
import { ExecutionMode } from "../interfaces/Session.interface";

/**
 * Base interface representing the common arguments required for all completion requests.
 * Contains only the essential fields shared by all completion types.
 * Extended by IOutlineCompletionArgs and ISwarmCompletionArgs to add specific fields.
 * @template Message - The type of message, extending IBaseMessage with any role type. Defaults to IBaseMessage with string role.
 * @interface IBaseCompletionArgs
 */
export interface IBaseCompletionArgs<
  Message extends IBaseMessage<any> = IBaseMessage<BaseMessageRole>
> {
  /** client identifier for tracking and error handling. */
  clientId: string;
  /** An array of messages providing the conversation history or context for the completion.*/
  messages: Message[];
}
