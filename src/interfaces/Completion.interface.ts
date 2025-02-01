import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
import { ExecutionMode } from "./Session.interface";

/**
 * Interface representing a completion.
 */
export interface ICompletion extends ICompletionSchema { }

/**
 * Arguments required to get a completion.
 */
export interface ICompletionArgs {
  /**
   * Client ID.
   */
  clientId: string,
  /**
   * Name of the agent.
   */
  agentName: AgentName, 
  /**
   * The source of the last message: tool or user
   */
  mode: ExecutionMode;
  /**
   * Array of model messages.
   */
  messages: IModelMessage[],
  /**
   * Optional array of tools.
   */
  tools?: ITool[]
}

/**
 * Schema for a completion.
 */
export interface ICompletionSchema {
  /**
   * Name of the completion.
   */
  completionName: CompletionName;
  /**
   * Method to get a completion.
   * @param args - Arguments required to get a completion.
   * @returns A promise that resolves to a model message.
   */
  getCompletion(args: ICompletionArgs): Promise<IModelMessage>;
  /**
   * Callback fired after complete.
   * @param args - Arguments passed to complete
   * @param output - Output of the model
   */
  onComplete?: (args: ICompletionArgs, output: IModelMessage) => void;
}

/**
 * Type representing the name of a completion.
 */
export type CompletionName = string;
