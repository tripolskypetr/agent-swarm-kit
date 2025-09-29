import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";

const METHOD_NAME = "function.target.emit";

/**
 * Function implementation
 */
const emitInternal = beginContext(
  async (content: string, clientId: string, agentName: AgentName) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        agentName,
      });

    // Validate the agent, session, and swarm
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Check if the specified agent is still the active agent
    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
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

    // Emit the content directly via the session public service
    return await swarm.sessionPublicService.emit(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Emits a string as model output without executing an incoming message, with agent activity validation.
 *
 * This function directly emits a provided string as output from the swarm session, bypassing message execution, and is designed exclusively
 * for sessions established via `makeConnection`. It validates the session, swarm, and specified agent, ensuring the agent is still active
 * before emitting. If the active agent has changed, the operation is skipped. The execution is wrapped in `beginContext` for a clean environment,
 * logs the operation if enabled, and throws an error if the session mode is not "makeConnection".
 *
 * @throws {Error} If the session mode is not "makeConnection", or if agent, session, or swarm validation fails.
 * @example
 * await emit("Direct output", "client-123", "AgentX"); // Emits "Direct output" if AgentX is active
 */
export async function emit(content: string, clientId: string, agentName: AgentName) {
  return await emitInternal(content, clientId, agentName);
}
