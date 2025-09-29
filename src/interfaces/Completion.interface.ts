import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
import { IOutlineFormat, IOutlineMessage, OutlineName } from "./Outline.interface";
import { ExecutionMode } from "./Session.interface";

/**
 * Interface representing a completion mechanism.
 * Extends the completion schema to provide a complete API for generating model responses.
 * @extends {ICompletionSchema}
 */
export interface ICompletion extends ICompletionSchema {}

/**
 * Interface representing the arguments required to request a completion.
 * Encapsulates context and inputs for generating a model response.
 */
export interface ICompletionArgs {
  /**
   * The unique identifier for the client making the request.
   * This is used to track the request and associate it with the correct client context.
   * For outline completions, this being skipped
   */
  clientId?: string;

  /**
   * The name of the agent for which the completion is requested.
   * This is used to identify the agent context in which the completion will be generated.
   */
  agentName?: AgentName;

  /**
   * The outline used for json completions, if applicable.
   * This is the name of the outline schema that defines the structure of the expected JSON response.
   * Used to ensure that the completion adheres to the specified outline format.
   */
  outlineName?: OutlineName;

  /** The source of the last message, indicating whether it originated from a tool or user. */
  mode: ExecutionMode;

  /** An array of model messages providing the conversation history or context for the completion. */
  messages: (IModelMessage | IOutlineMessage)[];

  /** Optional array of tools available for the completion process (e.g., for tool calls). */
  tools?: ITool[];

  /**
   * Optional format for the outline, specifying how the completion should be structured.
   * This is used to define the expected output format for JSON completions.
   * If not provided, the default outline format will be used.
   * @optional
   */
  format?: IOutlineFormat;
}

/**
 * Interface representing lifecycle callbacks for completion events.
 * Provides hooks for post-completion actions.
 */
export interface ICompletionCallbacks {
  /**
   * Optional callback triggered after a completion is successfully generated.
   * Useful for logging, output processing, or triggering side effects.
   */
  onComplete?: (args: ICompletionArgs, output: IModelMessage | IOutlineMessage) => void;
}

/**
 * Interface representing the schema for configuring a completion mechanism.
 * Defines how completions are generated within the swarm.
 */
export interface ICompletionSchema {
  /** The unique name of the completion mechanism within the swarm. */
  completionName: CompletionName;

  /**
   * Retrieves a completion based on the provided arguments.
   * Generates a model response using the given context and tools.
   * @throws {Error} If completion generation fails (e.g., due to invalid arguments, model errors, or tool issues).
   */
  getCompletion(args: ICompletionArgs): Promise<IModelMessage | IOutlineMessage>;

  /*
   * Flag if the completion is a JSON completion.
   * If true, the completion will be treated as a JSON object.
   * Should be used for completions that return structured data using Outlines.
   */
  json?: boolean;

  /** List of flags for llm model. As example, `/no_think` for `lmstudio-community/Qwen3-32B-GGUF`  */
  flags?: string[];

  /** Optional partial set of callbacks for completion events, allowing customization of post-completion behavior. */
  callbacks?: Partial<ICompletionCallbacks>;
}

/**
 * Type representing the unique name of a completion mechanism within the swarm.
 * Used to identify and reference specific completion implementations.
 */
export type CompletionName = string;
