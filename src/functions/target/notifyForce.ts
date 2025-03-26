import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";

const METHOD_NAME = "function.target.notifyForce";

/**
 * Sends a notification message as output from the swarm session without executing an incoming message.
 *
 * This function directly sends a provided string as output from the swarm session, bypassing message execution. It is designed exclusively
 * for sessions established via the "makeConnection" mode. The function validates the session, swarm, and specified agent, ensuring the agent
 * is still active before sending the notification. Will notify even if the agent was changed. The execution is wrapped in
 * `beginContext` for a clean environment, logs the operation if enabled, and throws an error if the session mode is not "makeConnection".
 *
 * @param {string} content - The content to be sent as the notification output.
 * @param {string} clientId - The unique identifier of the client session sending the notification.
 * @param {AgentName} agentName - The name of the agent intended to send the notification.
 * @returns {Promise<void>} A promise that resolves when the notification is sent
 * @throws {Error} If the session mode is not "makeConnection", or if agent, session, or swarm validation fails.
 * @example
 * await notifyForce("Direct output", "client-123", "AgentX"); // Sends "Direct output" if AgentX is active
 */
export const notifyForce = beginContext(
  async (content: string, clientId: string, agentName: AgentName) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        agentName,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);

    // Check if the session mode is "makeConnection"
    if (
      swarm.sessionValidationService.getSessionMode(clientId) !==
      "makeConnection"
    ) {
      throw new Error(
        `agent-swarm-kit notifyForce session is not makeConnection clientId=${clientId}`
      );
    }

    // Validate the agent, session, and swarm
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Check if the specified agent is still the active agent
    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );

    // Notify the content directly via the session public service
    return await swarm.sessionPublicService.notify(
      content,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
