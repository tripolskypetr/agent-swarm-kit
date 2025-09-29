/**
 *  * Defines interfaces and types for pipeline schemas and callbacks.
 */

import { AgentName } from "../interfaces/Agent.interface";

/**
 *  *  * Defines the schema for a pipeline, including execution logic and optional callbacks.
 */
export interface IPipelineSchema<Payload extends object = any> {
  /**
   *    * The name of the pipeline.
   */
  pipelineName: PipelineName;

  /**
   *    * Function to execute the pipeline logic.
   *    *    *    *    *    */
  execute: <T = any>(clientId: string, agentName: AgentName, payload: Payload) => Promise<T | void>;

  /**
   * Optional callbacks for pipeline lifecycle events.
   * Provides hooks for monitoring pipeline execution, handling errors, and customizing behavior.
   */
  callbacks?: Partial<IPipelineCallbacks<Payload>>;
}

/**
 *  *  * Defines callback functions for pipeline lifecycle events.
 */
export interface IPipelineCallbacks<Payload extends object = any> {
  /**
   *    * Called when the pipeline execution starts.
   *    *    *    */
  onStart: (clientId: string, pipelineName: PipelineName, payload: Payload) => void;

  /**
   *    * Called when the pipeline execution ends, indicating success or failure.
   *    *    *    *    */
  onEnd: (clientId: string, pipelineName: PipelineName, payload: Payload, isError: boolean) => void;

  /**
   * Called when an error occurs during pipeline execution.
   * Provides error handling capabilities for pipeline failures and debugging.
   */
  onError: (clientId: string, pipelineName: PipelineName, payload: Payload, error: Error) => void;
}

/**
 * Type alias for the pipeline name, represented as a string.
 * Used to identify and reference specific pipeline instances.
 */
export type PipelineName = string;
