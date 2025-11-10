import { IBaseCompletionArgs } from "./BaseCompletion.contract";
import { OutlineName, IOutlineFormat } from "../interfaces/Outline.interface";
import { IOutlineMessage, OutlineMessageRole } from "./OutlineMessage.contract";

/**
 * Interface representing the arguments for outline (JSON) completions.
 * Extends base completion args with outline-specific fields for structured JSON output.
 * Used for completions that return data conforming to a predefined schema.
 * @interface IOutlineCompletionArgs
 */
export interface IOutlineCompletionArgs extends IBaseCompletionArgs<IOutlineMessage> {
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
