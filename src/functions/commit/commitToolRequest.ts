import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IToolRequest } from "src/model/Tool.model";

const METHOD_NAME = "function.commit.commitToolRequest";

/**
 * Commits a tool request to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with AgentValidationService (agent validation), SessionValidationService (session and swarm retrieval),
 * SwarmValidationService (swarm validation), SwarmPublicService (agent retrieval), SessionPublicService (tool request committing),
 * and LoggerService (logging). Complements functions like commitSystemMessage by handling tool requests rather than system messages.
 *
 * @param {IToolRequest | IToolRequest[]} request - The tool request(s) to commit, either as a single request or an array of requests.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @param {string} agentName - The name of the agent to commit the request for, validated against registered agents.
 * @returns {Promise<string[] | null>} A promise that resolves with an array of results if the request is committed, or `null` if skipped (e.g., agent mismatch).
 * @throws {Error} If agent, session, or swarm validation fails, propagated from respective validation services.
 */
export const commitToolRequest = beginContext(
  async (request: IToolRequest | IToolRequest[], clientId: string, agentName: string): Promise<string[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        request,
        clientId,
        agentName,
      });

    swarm.agentValidationService.validate(agentName, METHOD_NAME);

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "commitToolRequest" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return null;
    }

    return await swarm.sessionPublicService.commitToolRequest(
      Array.isArray(request) ? request : [request],
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);