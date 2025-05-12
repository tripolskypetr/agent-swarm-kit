/**
 * @module startPipeline
 * @description Provides a function to initiate a pipeline execution with session validation, logging, and callback handling.
 */

import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { PipelineName } from "../../model/Pipeline.model";
import { AgentName } from "../../interfaces/Agent.interface";
import { changeToAgent } from "../navigate/changeToAgent";

/**
 * @constant {string} METHOD_NAME
 * @description Method name for the startPipeline operation.
 * @private
 */
const METHOD_NAME = "function.target.startPipeline";

/**
 * Function implementation
 */
const startPipelineInternal = beginContext(
  async (
    clientId: string,
    pipelineName: PipelineName,
    agentName: AgentName,
    payload: unknown = {}
  ): Promise<any> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        pipelineName,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.pipelineValidationService.validate(pipelineName, METHOD_NAME);
    swarm.agentValidationService.validate(agentName, METHOD_NAME);

    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      await swarm.sessionValidationService.getSwarm(clientId),
    );

    if (currentAgentName !== agentName) {
      await changeToAgent(agentName, clientId);
    }

    const { execute, callbacks } =
      swarm.pipelineSchemaService.get(pipelineName);

    let isError = false;
    let result = null;

    try {
      if (callbacks?.onStart) {
        callbacks.onStart(clientId, pipelineName, payload);
      }
      result = await execute(clientId, agentName, payload);
    } catch (error) {
      if (callbacks?.onError) {
        callbacks.onError(clientId, pipelineName, payload, error as Error);
      }
      isError = true;
    } finally {
      if (currentAgentName !== agentName) {
        await changeToAgent(currentAgentName, clientId);
      }
      if (callbacks?.onEnd) {
        callbacks.onEnd(clientId, pipelineName, payload, isError);
      }
    }
    return result;
  }
);

/**
 * @function startPipeline
 * @description Executes a pipeline with the specified name, handling session creation, validation, and lifecycle callbacks.
 * @template Payload - Type extending object for the pipeline payload.
 * @template T - Type of the result returned by the pipeline execution.
 * @param {string} clientId - The client identifier.
 * @param {PipelineName} pipelineName - The name of the pipeline to execute.
 * @param {AgentName} agentName - The name of the agent associated with the pipeline.
 * @param {Payload} [payload={}] - Optional payload data for the pipeline.
 * @returns {Promise<T>} The result of the pipeline execution.
 */
export async function startPipeline<Payload extends object = any, T = any>(
  clientId: string,
  pipelineName: PipelineName,
  agentName: AgentName,
  payload?: Payload
): Promise<T> {
  return await startPipelineInternal(clientId, pipelineName, agentName, payload);
}
