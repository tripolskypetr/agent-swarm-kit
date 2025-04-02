import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { IChatArgs, WikiName } from "../../interfaces/Wiki.interface";

/** @constant {string} METHOD_NAME - The name of the method used for logging and validation */
const METHOD_NAME = "function.target.questionForce";

/**
 * Initiates a forced question process within a chat context
 * @function questionForce
 * @param {string} message - The message/question to be processed
 * @param {string} clientId - Unique identifier for the client
 * @param {AgentName} agentName - Name of the agent handling the question
 * @param {WikiName} wikiName - Name of the wiki context
 * @returns {Promise<string>} The response from the chat process
 */
export const questionForce = beginContext(
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
