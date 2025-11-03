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
 * Initiates an ask process within a chat context.
 * Sends a message to the specified advisor and returns the chat response.
 * Supports custom message types including objects, Blob, or string.
 *
 * @function ask
 * @template T - The type of message content (defaults to string). Can be a custom object, Blob, or string.
 * @param {T} message - The message content to process or send. Type should match the advisor's expected message type.
 * @param {AdvisorName} advisorName - The name of the advisor to handle the message.
 * @param {Image[]} [images] - Optional array of images (as Uint8Array or string) to accompany the message.
 * @returns {Promise<string>} The response from the advisor's chat handler.
 *
 * @example
 * // Using default string message type
 * const response = await ask("Hello", "TextAdvisor");
 *
 * @example
 * // Using custom message type
 * interface CustomMessage { text: string; priority: number }
 * const response = await ask<CustomMessage>(
 *   { text: "Important", priority: 1 },
 *   "StructuredAdvisor"
 * );
 *
 * @example
 * // Using Blob message type with images
 * const blob = new Blob(["data"], { type: "text/plain" });
 * const response = await ask<Blob>(blob, "BlobAdvisor", [imageData]);
*/
export async function ask<T = string>(message: T, advisorName: AdvisorName, images?: Image[]) {
  return await askInternal(message as string, advisorName, images);
}
