import { IBaseMessage } from "./BaseMessage.contract";
import { IBaseCompletionArgs } from "./BaseCompletion.contract";
import { OutlineName, IOutlineFormat } from "../interfaces/Outline.interface";
import { OutlineMessageRole } from "./OutlineMessage.contract";

/**
 * Interface representing the arguments for outline (JSON) completions.
 * Extends base completion args with outline-specific fields for structured JSON output.
 * Used for completions that return data conforming to a predefined schema.
 * @template Message - The type of message, extending IBaseMessage with any role type. Defaults to IBaseMessage with string role.
 * @interface IOutlineCompletionArgs
 */
export interface IOutlineCompletionArgs<
  Message extends IBaseMessage<any> = IBaseMessage<OutlineMessageRole>
> extends IBaseCompletionArgs<Message> {
  /**
   * The outline schema name (required).
   * Defines the structure of the expected JSON response.
   */
  outlineName: OutlineName;

  /**
   * The outline format (required).
   * Specifies how the completion should be structured.
   */
  format: IOutlineFormat;
}
