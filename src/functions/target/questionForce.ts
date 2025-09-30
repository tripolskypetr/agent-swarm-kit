import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IChatArgs, WikiName } from "../../interfaces/Wiki.interface";

/** @constant {string} METHOD_NAME - The name of the method used for logging and validation*/
const METHOD_NAME = "function.target.questionForce";

/**
 * Function implementation
*/
const questionForceInternal = beginContext(
  async (message: string, clientId: string, wikiName: WikiName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        message,
        clientId,
        wikiName,
      });

    swarm.sessionValidationService.validate(clientId, METHOD_NAME);

    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    swarm.wikiValidationService.validate(wikiName, METHOD_NAME);

    const { getChat, callbacks } = swarm.wikiSchemaService.get(wikiName);

    const agentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );

    const args: IChatArgs = {
      clientId,
      message,
      agentName
    };

    if (callbacks?.onChat) {
      callbacks.onChat(args)
    }

    return await getChat(args);
  }
);

/**
 * Initiates a forced question process within a chat context
 * @function questionForce
 * @param {string} message - The message content to process or send.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {WikiName} wikiName - The name of the wiki.
*/
export async function questionForce(message: string, clientId: string, wikiName: WikiName) {
  return await questionForceInternal(message, clientId, wikiName);
}
