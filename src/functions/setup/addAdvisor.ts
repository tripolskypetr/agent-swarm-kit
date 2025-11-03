import { IAdvisorSchema } from "../../interfaces/Advisor.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/** @constant {string} METHOD_NAME - The name of the method used for logging*/
const METHOD_NAME = "function.setup.addAdvisor";

/**
 * Function implementation
*/
const addAdvisorInternal = beginContext(
  (advisorSchema: IAdvisorSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        advisorSchema,
      });

    swarm.advisorValidationService.addAdvisor(
      advisorSchema.advisorName,
      advisorSchema,
    );
    swarm.advisorSchemaService.register(
      advisorSchema.advisorName,
      advisorSchema
    );

    return advisorSchema.advisorName;
  }
);

/**
 * Adds an advisor schema to the system.
 * Registers the advisor with validation and schema services, making it available for chat operations.
 *
 * @function addAdvisor
 * @template T - The type of message content the advisor accepts (defaults to string). Can be a custom object, Blob, or string.
 * @param {IAdvisorSchema<T>} advisorSchema - The schema definition for advisor, including name, chat handler, and optional callbacks.
 * @returns {string} The advisorName that was registered.
 *
 * @example
 * // Using default string message type
 * addAdvisor({
 *   advisorName: "TextAdvisor",
 *   getChat: async (args) => `Response to: ${args.message}`
 * });
 *
 * @example
 * // Using custom message type
 * interface CustomMessage { text: string; metadata: Record<string, any> }
 * addAdvisor<CustomMessage>({
 *   advisorName: "StructuredAdvisor",
 *   getChat: async (args) => `Processing: ${args.message.text}`
 * });
 *
 * @example
 * // Using Blob message type
 * addAdvisor<Blob>({
 *   advisorName: "BlobAdvisor",
 *   getChat: async (args) => `Received blob of size: ${args.message.size}`
 * });
*/
export function addAdvisor<T = string>(advisorSchema: IAdvisorSchema<T>) {
  return addAdvisorInternal(advisorSchema as IAdvisorSchema);
}
