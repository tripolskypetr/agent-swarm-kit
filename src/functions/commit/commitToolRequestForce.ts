import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IToolRequest } from "../../model/Tool.model";

const METHOD_NAME = "function.commit.commitToolRequestForce";

/**
 * Function implementation
 */
const commitToolRequestForceInternal = beginContext(
  async (
    request: IToolRequest | IToolRequest[],
    clientId: string
  ): Promise<string[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        request,
        clientId,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    const requests = Array.isArray(request) ? request : [request];

    return await swarm.sessionPublicService.commitToolRequest(
      requests,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
);

/**
 * Forcefully commits a tool request to the active agent in the swarm system.
 * Validates the session and swarm, bypassing agent validation to directly commit the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 *
 * @throws {Error} If session or swarm validation fails.
 * 
 * Function overloads
 */
export function commitToolRequestForce(
  request: IToolRequest,
  clientId: string
): Promise<string[]>;

/**
 * Forcefully commits a tool request to the active agent in the swarm system.
 * Validates the session and swarm, bypassing agent validation to directly commit the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 *
 * @throws {Error} If session or swarm validation fails.
 * 
 * Function overloads
 */
export function commitToolRequestForce(
  request: IToolRequest[],
  clientId: string
): Promise<string[]>;

/**
 * Forcefully commits a tool request to the active agent in the swarm system.
 * Validates the session and swarm, bypassing agent validation to directly commit the request.
 * Runs within a beginContext wrapper for execution context management, logging operations via LoggerService.
 *
 * @throws {Error} If session or swarm validation fails.
 */
export async function commitToolRequestForce(
  request: IToolRequest | IToolRequest[],
  clientId: string
): Promise<string[]> {
  return await commitToolRequestForceInternal(request, clientId);
}
