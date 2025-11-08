import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import { CompletionName } from "../../interfaces/Completion.interface";
import { randomString } from "functools-kit";
import { errorSubject } from "../../config/emitters";
import { IBaseMessage } from "../../contract/BaseMessage.contract";
import { IOutlineMessage } from "../../contract/OutlineMessage.contract";

const METHOD_NAME = "function.target.chat";

/**
 * Internal function to process a chat completion request.
 * Executes outside existing contexts using `beginContext` to ensure isolation.
 * Processes a single completion request and returns the output message.
 * @private
 * @async
 */
const chatInternal = beginContext(
  async (
    completionName: CompletionName,
    messages: IBaseMessage[]
  ): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {});

    swarm.completionValidationService.validate(completionName, METHOD_NAME);

    const resultId = randomString();
    const clientId = `${resultId}_chat`;

    const completionSchema = swarm.completionSchemaService.get(completionName);

    if (completionSchema.json) {
      throw new Error(
        `${METHOD_NAME} completion ${completionName} should not have json=true. Use a non-JSON completion for chat.`
      );
    }

    const { getCompletion } = completionSchema;

    let errorValue = null;

    const unError = errorSubject.subscribe(([errorClientId, error]) => {
      if (clientId === errorClientId) {
        errorValue = error;
      }
    });

    const { content } = await getCompletion({
      clientId,
      messages,
      mode: "user",
    });

    unError();

    if (errorValue) {
      throw errorValue;
    }

    return content;
  }
);

/**
 * Processes a chat completion request by sending messages to a specified completion service.
 * Delegates to an internal context-isolated function to ensure clean execution.
 * @async
 *
 * @param completionName The name of the completion service to use.
 * @param messages Array of messages representing the conversation history.
 * @example
 * // Example usage
 * const output = await chat("openai", [
 *   { role: "system", content: "You are a helpful assistant." },
 *   { role: "user", content: "Hello, how are you?" }
 * ]);
 * console.log(output.content); // Logs the completion output
 */
export async function chat(
  completionName: CompletionName,
  messages: IOutlineMessage[]
): Promise<string> {
  return await chatInternal(completionName, messages);
}
