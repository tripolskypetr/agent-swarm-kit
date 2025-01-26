import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

/**
 * Emits a string constant as the model output without executing incoming message
 * Works only for `makeConnection`
 *
 * @param {string} content - The content to be emitted.
 * @param {string} clientId - The client ID of the session.
 * @param {AgentName} agentName - The name of the agent to emit the content to.
 * @throws Will throw an error if the session mode is not "makeConnection".
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 */
export const emit = async (
  content: string,
  clientId: string,
  agentName: AgentName
) => {
  swarm.loggerService.log("function emit", {
    content,
    clientId,
    agentName,
  });
  if (swarm.sessionValidationService.getSessionMode(clientId) !== "makeConnection") {
    throw new Error(`agent-swarm-kit emit session is not makeConnection clientId=${clientId}`);
  }
  swarm.agentValidationService.validate(agentName, "execute");
  swarm.sessionValidationService.validate(clientId, "execute");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "execute");
  const currentAgentName = await swarm.swarmPublicService.getAgentName(
    clientId,
    swarmName
  );
  if (currentAgentName !== agentName) {
    swarm.loggerService.log(
      'function "emit" skipped due to the agent change',
      {
        currentAgentName,
        agentName,
        clientId,
      }
    );
    return;
  }
  return await swarm.sessionPublicService.emit(content, clientId, swarmName);
};
