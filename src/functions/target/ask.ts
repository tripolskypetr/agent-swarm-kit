import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { AdvisorName } from "../../interfaces/Advisor.interface";

/** @constant {string} METHOD_NAME - The name of the method used for logging and validation*/
const METHOD_NAME = "function.target.ask";

/**
 * Function implementation
*/
const askInternal = beginContext(
  async (message: string, advisorName: AdvisorName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        message,
        advisorName,
      });

    swarm.advisorValidationService.validate(advisorName, METHOD_NAME);

    const { getChat, callbacks } = swarm.advisorSchemaService.get(advisorName);

    if (callbacks?.onChat) {
      callbacks.onChat(message)
    }

    return await getChat(message);
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
 * @returns {Promise<string>} The response from the advisor's chat handler.
 *
 * @example
 * // Using default string message type
 * const response = await ask("Hello", "TextAdvisor");
 *
 * @example
 * // Using custom message type with structured data
 * interface CustomMessage { text: string; priority: number; attachments?: Uint8Array[] }
 * const response = await ask<CustomMessage>(
 *   { text: "Important", priority: 1, attachments: [data] },
 *   "StructuredAdvisor"
 * );
 *
 * @example
 * // Using Blob message type
 * const blob = new Blob(["data"], { type: "text/plain" });
 * const response = await ask<Blob>(blob, "BlobAdvisor");
*/
export async function ask<T = string>(message: T, advisorName: AdvisorName) {
  return await askInternal(message as string, advisorName);
}
