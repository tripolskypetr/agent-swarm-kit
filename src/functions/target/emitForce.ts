import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.target.emitForce";

/**
 * Function implementation
 */
const emitForceInternal = beginContext(
  async (content: string, clientId: string) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
      });

    // Validate the session and swarm
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

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
 * Emits a string as model output without executing an incoming message or checking the active agent.
 *
 * This function directly emits a provided string as output from the swarm session, bypassing message execution and agent activity checks.
 * It is designed exclusively for sessions established via `makeConnection`, ensuring compatibility with its connection model.
 * The execution is wrapped in `beginContext` for a clean environment, validates the session and swarm, and throws an error if the session mode
 * is not "makeConnection". The operation is logged if enabled, and resolves when the content is successfully emitted.
 *
 * @param {string} content - The content to be emitted as the model output.
 * @param {string} clientId - The unique identifier of the client session emitting the content.
 * @returns {Promise<void>} A promise that resolves when the content is emitted.
 * @throws {Error} If the session mode is not "makeConnection", or if session or swarm validation fails.
 * @example
 * await emitForce("Direct output", "client-123"); // Emits "Direct output" in a makeConnection session
 */
export async function emitForce(content: string, clientId: string) {
  return await emitForceInternal(content, clientId);
}
