import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
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
  /** The unique ID of the client requesting the completion. */
  clientId: string;

  /** The unique name of the agent associated with the completion request. */
  agentName: AgentName;

  /** The source of the last message, indicating whether it originated from a tool or user. */
  mode: ExecutionMode;

  /** An array of model messages providing the conversation history or context for the completion. */
  messages: IModelMessage[];

  /** Optional array of tools available for the completion process (e.g., for tool calls). */
  tools?: ITool[];
}

/**
 * Interface representing lifecycle callbacks for completion events.
 * Provides hooks for post-completion actions.
 */
export interface ICompletionCallbacks {
  /**
   * Optional callback triggered after a completion is successfully generated.
   * Useful for logging, output processing, or triggering side effects.
   * @param {ICompletionArgs} args - The arguments used to generate the completion.
   * @param {IModelMessage} output - The model-generated message resulting from the completion.
   */
  onComplete?: (args: ICompletionArgs, output: IModelMessage) => void;
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
   * @param {ICompletionArgs} args - The arguments required to generate the completion, including client, agent, and message context.
   * @returns {Promise<IModelMessage>} A promise resolving to the generated model message.
   * @throws {Error} If completion generation fails (e.g., due to invalid arguments, model errors, or tool issues).
   */
  getCompletion(args: ICompletionArgs): Promise<IModelMessage>;

  /** List of flags for llm model. As example, `/no_think` for `lmstudio-community/Qwen3-32B-GGUF`  */
  flags?: string[];

  /** Optional partial set of callbacks for completion events, allowing customization of post-completion behavior. */
  callbacks?: Partial<ICompletionCallbacks>;
}

/**
 * Type representing the unique name of a completion mechanism within the swarm.
 * @typedef {string} CompletionName
 */
export type CompletionName = string;
