import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IToolRequest } from "src/model/Tool.model";

const METHOD_NAME = "function.commit.commitToolRequestForce";

/**
 * Forcefully commits a tool request to the active agent in the swarm system.
 * Validates the session and swarm, bypassing agent validation to directly commit the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 * Integrates with SessionValidationService (session and swarm retrieval), SwarmValidationService (swarm validation),
 * SessionPublicService (tool request committing), and LoggerService (logging).
 * Complements functions like commitToolRequest by skipping agent validation for direct tool request commits.
 *
 * @param {IToolRequest | IToolRequest[]} request - The tool request(s) to commit, either as a single request or an array of requests.
 * @param {string} clientId - The ID of the client associated with the session, validated against active sessions.
 * @returns {Promise<string[]>} A promise that resolves with an array of results if the request is committed.
 * @throws {Error} If session or swarm validation fails, propagated from respective validation services.
 */
export const commitToolRequestForce = beginContext(
  async (request: IToolRequest | IToolRequest[], clientId: string): Promise<string[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        request,
        clientId,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    return await swarm.sessionPublicService.commitToolRequest(
      Array.isArray(request) ? request : [request],
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);
