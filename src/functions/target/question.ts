import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { IChatArgs, WikiName } from "../../interfaces/Wiki.interface";

/** Image type as either an array of Uint8Array or an array of strings */
type Image = Uint8Array | string;

/** @constant {string} METHOD_NAME - The name of the method used for logging and validation*/
const METHOD_NAME = "function.target.question";

/**
 * Function implementation
*/
const questionInternal = beginContext(
  async (message: string, wikiName: WikiName, images: Image[] = []) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        message,
        wikiName,
      });

    swarm.wikiValidationService.validate(wikiName, METHOD_NAME);

    const { getChat, callbacks } = swarm.wikiSchemaService.get(wikiName);

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
 * Initiates a question process within a chat context
 * @function question
 * @param {string} message - The message content to process or send.
 * @param {WikiName} wikiName - The name of the wiki.
 * @param {Image[]} [images] - Optional array of images (as Uint8Array or string).
*/
export async function question(message: string, wikiName: WikiName, images?: Image[]) {
  return await questionInternal(message, wikiName, images);
}
