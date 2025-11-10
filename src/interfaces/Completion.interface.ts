import { IBaseMessage } from "../contract/BaseMessage.contract";
import { IBaseCompletionArgs } from "../contract/BaseCompletion.contract";

/*
import { addCompletion } from "../functions/setup/addCompletion";
import { ISwarmMessage } from "../contract/SwarmMessage.contract";
import { IOutlineCompletionArgs } from "../contract/OutlineCompletion.contract";
import { ISwarmCompletionArgs } from "../contract/SwarmCompletion.contract";


addCompletion({
  completionName: "test",
  getCompletion: async (
    params: ISwarmCompletionArgs
  ): Promise<ISwarmMessage> => {
    params.messages[0].role === "assistant";
    return null as never;
  },
  callbacks: {
    onComplete: (args) => {}
  }
});
*/

/**
 * Interface representing a completion mechanism.
 * Extends the completion schema to provide a complete API for generating model responses.
 * @extends {ICompletionSchema}
 */
export interface ICompletion extends ICompletionSchema {}

/**
 * Interface representing lifecycle callbacks for completion events.
 * Provides hooks for post-completion actions.
 * @template Message - The type of message, extending IBaseMessage with any role type. Defaults to IBaseMessage with string role.
 */
export interface ICompletionCallbacks<
  Message extends IBaseMessage<any> = IBaseMessage<string>,
  Args extends IBaseCompletionArgs<IBaseMessage<string>> = IBaseCompletionArgs<
    IBaseMessage<string>
  >
> {
  /**
   * Optional callback triggered after a completion is successfully generated.
   * Useful for logging, output processing, or triggering side effects.
   */
  onComplete?: (args: Args, output: Message) => void;
}

/**
 * Interface representing the schema for configuring a completion mechanism.
 * Defines how completions are generated within the swarm.
 * @template Message - The type of message, extending IBaseMessage with any role type. Defaults to IBaseMessage for maximum flexibility.
 * @template Args - The type of completion arguments, defaults to any completion args type.
 */
export interface ICompletionSchema<
  Message extends IBaseMessage<string> = IBaseMessage<any>,
  Args extends IBaseCompletionArgs<IBaseMessage<string>> = IBaseCompletionArgs<
    IBaseMessage<string>
  >
> {
  /** The unique name of the completion mechanism within the swarm.*/
  completionName: CompletionName;

  /**
   * Retrieves a completion based on the provided arguments.
   * Generates a model response using the given context and tools.
   * @throws {Error} If completion generation fails (e.g., due to invalid arguments, model errors, or tool issues).
   */
  getCompletion(args: Args): Promise<Message>;

  /*
   * Flag if the completion is a JSON completion.
   * If true, the completion will be treated as a JSON object.
   * Should be used for completions that return structured data using Outlines.
   */
  json?: boolean;

  /** List of flags for llm model. As example, `/no_think` for `lmstudio-community/Qwen3-32B-GGUF` */
  flags?: string[];

  /** Optional partial set of callbacks for completion events, allowing customization of post-completion behavior.*/
  callbacks?: Partial<ICompletionCallbacks<Message, Args>>;
}

/**
 * Type representing the unique name of a completion mechanism within the swarm.
 * Used to identify and reference specific completion implementations.
 */
export type CompletionName = string;
