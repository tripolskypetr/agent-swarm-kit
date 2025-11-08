import { IBaseMessage, BaseMessageRole } from "./BaseMessage.contract";

/**
 * Type representing roles specific to outline messages.
 * Uses the base message roles without additional extensions.
 */
export type OutlineMessageRole = BaseMessageRole;

/**
 * Interface representing a message in the outline system.
 * Used to structure messages stored in the outline history, typically for user, assistant, or system interactions.
 * @extends {IBaseMessage}
 * @interface IOutlineMessage
*/
export interface IOutlineMessage extends IBaseMessage<OutlineMessageRole> {
  // Inherits role from IBaseMessage with type OutlineMessageRole
}
