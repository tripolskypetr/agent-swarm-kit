import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { PipelineName } from "../../model/Pipeline.model";
import { Chat } from "../../classes/Chat";
import { SwarmName } from "../../interfaces/Swarm.interface";

const METHOD_NAME = "function.target.startPipeline";

export const startPipeline = beginContext(
  async <T = any>(
    clientId: string,
    pipelineName: PipelineName,
    swarmName: SwarmName,
    payload: unknown = {}
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        pipelineName,
      });

    await Chat.beginChat(clientId, swarmName);

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.pipelineValidationService.validate(pipelineName, METHOD_NAME);

    const agentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );

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
      if (callbacks?.onEnd) {
        callbacks.onEnd(clientId, pipelineName, payload, isError);
      }
    }
    return result;
  }
) as <Payload extends object = any, T = any>(
  clientId: string,
  pipelineName: PipelineName,
  swarmName: SwarmName,
  payload?: Payload
) => Promise<T>;
