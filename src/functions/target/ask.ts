import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IChatArgs, AdvisorName } from "../../interfaces/Advisor.interface";

/** Image type as either an array of Uint8Array or an array of strings */
type Image = Uint8Array | string;

/** @constant {string} METHOD_NAME - The name of the method used for logging and validation*/
const METHOD_NAME = "function.target.ask";

/**
 * Function implementation
*/
const askInternal = beginContext(
  async (message: string, advisorName: AdvisorName, images: Image[] = []) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        message,
        advisorName,
      });

    swarm.advisorValidationService.validate(advisorName, METHOD_NAME);

    const { getChat, callbacks } = swarm.advisorSchemaService.get(advisorName);

    const args: IChatArgs = {
      message,
      images,
    };

    if (callbacks?.onChat) {
      callbacks.onChat(args)
    }

    return await getChat(args);
  }
);

/**
 * Initiates an ask process within a chat context
 * @function ask
 * @param {T} message - The message content to process or send.
 * @param {AdvisorName} advisorName - The name of the advisor.
 * @param {Image[]} [images] - Optional array of images (as Uint8Array or string).
*/
export async function ask<T = string>(message: T, advisorName: AdvisorName, images?: Image[]) {
  return await askInternal(message as string, advisorName, images);
}
