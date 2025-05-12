import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IToolRequest } from "../../model/Tool.model";

const METHOD_NAME = "function.commit.commitToolRequest";

/**
 * Function implementation
 */
const commitToolRequestInternal = beginContext(
  async (
    request: IToolRequest | IToolRequest[],
    clientId: string,
    agentName: string
  ): Promise<string[]> => {
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

/**
 * Commits a tool request to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 *
 * @param {IToolRequest | IToolRequest[]} request - The tool request(s) to commit.
 * @param {string} clientId - The client ID associated with the session.
 * @param {string} agentName - The agent name to commit the request for.
 * @returns {Promise<string[] | null>} A promise resolving with an array of result strings, or null if skipped due to agent mismatch.
 * 
 * Function overloads
 */
export function commitToolRequest(
  request: IToolRequest,
  clientId: string,
  agentName: string
): Promise<string[]>;

/**
 * Commits a tool request to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 *
 * @param {IToolRequest | IToolRequest[]} request - The tool request(s) to commit.
 * @param {string} clientId - The client ID associated with the session.
 * @param {string} agentName - The agent name to commit the request for.
 * @returns {Promise<string[] | null>} A promise resolving with an array of result strings, or null if skipped due to agent mismatch.
 * 
 * Function overloads
 */
export function commitToolRequest(
  request: IToolRequest[],
  clientId: string,
  agentName: string
): Promise<string[]>;

/**
 * Commits a tool request to the active agent in the swarm system.
 * Validates the agent, session, and swarm, ensuring the current agent matches the provided agent before committing the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 *
 * @param {IToolRequest | IToolRequest[]} request - The tool request(s) to commit.
 * @param {string} clientId - The client ID associated with the session.
 * @param {string} agentName - The agent name to commit the request for.
 * @returns {Promise<string[] | null>} A promise resolving with an array of result strings, or null if skipped due to agent mismatch.
 */
export async function commitToolRequest(
  request: IToolRequest | IToolRequest[],
  clientId: string,
  agentName: string
): Promise<string[]> {
  return await commitToolRequestInternal(request, clientId, agentName);
}
