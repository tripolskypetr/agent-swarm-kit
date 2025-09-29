/**
 * @module PipelineModel
 * @description Defines interfaces and types for pipeline schemas and callbacks.
 */

import { AgentName } from "../interfaces/Agent.interface";

/**
 * @interface IPipelineSchema
 * @template Payload - Type extending object for the pipeline payload.
 * @description Defines the schema for a pipeline, including execution logic and optional callbacks.
 */
export interface IPipelineSchema<Payload extends object = any> {
  /**
   * @property {PipelineName} pipelineName
   * @description The name of the pipeline.
   */
  pipelineName: PipelineName;

  /**
   * @property {Function} execute
   * @description Function to execute the pipeline logic.
   * @template T - Type of the execution result.
   * @param {string} clientId - The client identifier.
   * @param {Payload} payload - The payload data for the pipeline.
   * @param {AgentName} agentName - The name of the agent executing the pipeline.
   * @returns {Promise<T>} The result of the pipeline execution.
   */
  execute: <T = any>(clientId: string, agentName: AgentName, payload: Payload) => Promise<T | void>;

  /**
   * Optional callbacks for pipeline lifecycle events.
   * Provides hooks for monitoring pipeline execution, handling errors, and customizing behavior.
   */
  callbacks?: Partial<IPipelineCallbacks<Payload>>;
}

/**
 * @interface IPipelineCallbacks
 * @template Payload - Type extending object for the pipeline payload.
 * @description Defines callback functions for pipeline lifecycle events.
 */
export interface IPipelineCallbacks<Payload extends object = any> {
  /**
   * @method onStart
   * @description Called when the pipeline execution starts.
   * @param {string} clientId - The client identifier.
   * @param {PipelineName} pipelineName - The name of the pipeline.
   * @param {Payload} payload - The payload data for the pipeline.
   */
  onStart: (clientId: string, pipelineName: PipelineName, payload: Payload) => void;

  /**
   * @method onEnd
   * @description Called when the pipeline execution ends, indicating success or failure.
   * @param {string} clientId - The client identifier.
   * @param {PipelineName} pipelineName - The name of the pipeline.
   * @param {Payload} payload - The payload data for the pipeline.
   * @param {boolean} isError - Indicates if the pipeline ended with an error.
   */
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
