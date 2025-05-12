import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm, { PayloadContextService } from "../../lib";
import { ExecutionMode } from "../../interfaces/Session.interface";

const METHOD_NAME = "function.commit.commitSystemMessage";

/**
 * Function implementation
 */
const commitUserMessageInternal = beginContext(
  async <Payload extends object = object>(
    content: string,
    mode: ExecutionMode,
    clientId: string,
    agentName: string,
    payload?: Payload
  ) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        content,
        clientId,
        agentName,
        mode,
      });

    // Validate the agent, session, and swarm to ensure they exist and are accessible
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

    // Check if the specified agent is still the active agent in the swarm session
    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      // Log a skip message if the agent has changed during the operation
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "commitUserMessage" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return;
    }

    if (payload) {
      return await PayloadContextService.runInContext(
        async () => {
          await swarm.sessionPublicService.commitUserMessage(
            content,
            mode,
            METHOD_NAME,
            clientId,
            swarmName
          );
        },
        {
          clientId,
          payload,
        }
      );
    }

    // Commit the user message to the agent's history via the session public service
    return await swarm.sessionPublicService.commitUserMessage(
      content,
      mode,
      METHOD_NAME,
      clientId,
      swarmName
    );
  }
)

/**
 * Commits a user message to the active agent's history in a swarm session without triggering a response.
 *
 * This function commits a user message to the history of the specified agent, ensuring the agent is still active in the swarm session.
 * It performs validation checks on the agent, session, and swarm, logs the operation if enabled, and delegates the commit operation to the session public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} content - The content of the user message to be committed.
 * @param {string} clientId - The unique identifier of the client session associated with the operation.
 * @param {string} agentName - The name of the agent to whose history the message will be committed.
 * @returns {Promise<void>} A promise that resolves when the message is successfully committed, or immediately if the operation is skipped due to an agent change.
 * @throws {Error} If validation fails (e.g., invalid agent, session, or swarm) or if the session public service encounters an error during the commit operation.
 * @example
 * await commitUserMessage("User input message", "client-123", "AgentX");
 */
export async function commitUserMessage<Payload extends object = object>(
  content: string,
  mode: ExecutionMode,
  clientId: string,
  agentName: string,
  payload?: Payload
) {
  return await commitUserMessageInternal(content, mode, clientId, agentName, payload);
}
