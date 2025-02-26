import { randomString } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";

/**
 * Emits a string constant as the model output without executing incoming message and checking active agent
 * Works only for `makeConnection`
 *
 * @param {string} content - The content to be emitted.
 * @param {string} clientId - The client ID of the session.
 * @param {AgentName} agentName - The name of the agent to emit the content to.
 * @throws Will throw an error if the session mode is not "makeConnection".
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 */
export const emitForce = async (
  content: string,
  clientId: string,
) => {
  const requestId = randomString();
  swarm.loggerService.log("function emitForce", {
    content,
    clientId,
    requestId,
  });
  if (swarm.sessionValidationService.getSessionMode(clientId) !== "makeConnection") {
    throw new Error(`agent-swarm-kit emitForce session is not makeConnection clientId=${clientId}`);
  }
  swarm.sessionValidationService.validate(clientId, "emitForce");
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, "emitForce");
  return await swarm.sessionPublicService.emit(content, requestId, clientId, swarmName);
};
