import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { IChatArgs, WikiName } from "../../interfaces/Wiki.interface";

/** @constant {string} METHOD_NAME - The name of the method used for logging and validation */
const METHOD_NAME = "function.target.question";

/**
 * Function implementation
 */
const questionInternal = beginContext(
  async (message: string, clientId: string, agentName: AgentName, wikiName: WikiName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        message,
        clientId,
        agentName,
        wikiName,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);

    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    swarm.wikiValidationService.validate(wikiName, METHOD_NAME);

    if (
      !swarm.agentValidationService.hasWiki(
        agentName,
        wikiName
      )
    ) {
      throw new Error(
        `agent-swarm ${METHOD_NAME} ${wikiName} not registered in ${agentName}`
      );
    }

    const currentAgentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (currentAgentName !== agentName) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "question" skipped due to the agent change',
          {
            currentAgentName,
            agentName,
            clientId,
          }
        );
      return "";
    }

    const { getChat, callbacks } = swarm.wikiSchemaService.get(wikiName);

    const args: IChatArgs = {
      agentName,
      clientId,
      message,
    };

    if (callbacks?.onChat) {
      callbacks.onChat(args)
    }

    return await getChat(args);
  }
);

/**
 * Initiates a question process within a chat context
 * @function question
 * @param {string} message - The message content to process or send.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {AgentName} agentName - The name of the agent to use or reference.
 * @param {WikiName} wikiName - The name of the wiki.
 */
export async function question(message: string, clientId: string, agentName: AgentName, wikiName: WikiName) {
  return await questionInternal(message, clientId, agentName, wikiName);
}
