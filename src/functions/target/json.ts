import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import {
  IOutlineArgs,
  IOutlineParam,
  IOutlineData,
  IOutlineHistory,
  OutlineName,
  IOutlineMessage,
  IOutlineValidationArgs,
  IOutlineResult,
} from "../../interfaces/Outline.interface";
import { getErrorMessage, randomString } from "functools-kit";

const METHOD_NAME = "function.target.json";

const MAX_ATTEMPTS = 5;

/**
 * A class implementing the IOutlineHistory interface to manage a history of outline messages.
 * Provides methods to append, clear, and retrieve messages for tracking interactions in an outline process.
 * @class
 * @implements {IOutlineHistory }
 */
class OutlineHistory implements IOutlineHistory {
  /** @private */
  private messages: IOutlineMessage[] = [];

  /**
   * Appends one or more messages to the history.
   * Flattens nested arrays of messages and adds them to the internal message list.
   * @param {...(IOutlineMessage | IOutlineMessage[]): (IOutlineMessage | IOutlineMessage[])} messages - One or more messages or arrays of messages to append.
   * @returns {Promise<void>} A promise that resolves when the messages are appended.
   */
  async push(
    ...messages: (IOutlineMessage | IOutlineMessage[])[]
  ): Promise<void> {
    const flattenedMessages = messages.flat();
    this.messages.push(...flattenedMessages);
  }

  /**
   * Clears all messages from the history.
   * Resets the internal message list to an empty array.
   * @returns {Promise<void>} A promise that resolves when the history is cleared.
   */
  async clear(): Promise<void> {
    this.messages = [];
  }

  /**
   * Retrieves a copy of all messages in the history.
   * @returns {Promise<IOutlineMessage[]>} A promise resolving to an array of messages in the history.
   */
  async list(): Promise<IOutlineMessage[]> {
    return [...this.messages];
  }
}

/**
 * Internal function to process an outline request and generate structured JSON data.
 * Executes outside existing contexts using `beginContext` to ensure isolation.
 * Attempts to produce a valid structured data based on the outline schema, handling validations and retries up to a configurable maximum.
 * @private
 * @async
 * @param {OutlineName} outlineName - The unique name of the outline schema to process.
 * @param {IOutlineParam} param - The input param to process for structured data generation.
 * @returns {Promise<IOutlineResult>} A promise resolving to the outline result, indicating success or failure with associated details (e.g., history, error).
 */
const jsonInternal = beginContext(
  async (
    outlineName: OutlineName,
    param: IOutlineParam
  ): Promise<IOutlineResult> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {});

    const resultId = randomString();

    const {
      getStructuredOutput,
      validations = [],
      maxAttempts = MAX_ATTEMPTS,
      callbacks,
    } = swarm.outlineSchemaService.get(outlineName);

    let errorMessage: string = "";
    let history: OutlineHistory;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      history = new OutlineHistory();
      const inputArgs: IOutlineArgs = {
        attempt,
        param,
        history,
      };
      if (callbacks?.onAttempt) {
        callbacks.onAttempt(inputArgs);
      }
      const data = await getStructuredOutput(inputArgs);
      const validationArgs: IOutlineValidationArgs = {
        ...inputArgs,
        data,
      };
      for (const validation of validations) {
        const validate =
          typeof validation === "object" ? validation.validate : validation;
        try {
          await validate(validationArgs);
        } catch (error) {
          errorMessage = getErrorMessage(error);
        }
      }
      return {
        isValid: true,
        attempt,
        param,
        history: await history.list(),
        data,
        resultId,
      };
    }

    return {
      isValid: false,
      error: errorMessage ?? "Unknown error",
      attempt: maxAttempts,
      param,
      history: await history.list(),
      data: null,
      resultId,
    };
  }
);

/**
 * Processes an outline request to generate structured JSON data based on a specified outline schema.
 * Delegates to an internal context-isolated function to ensure clean execution.
 * @async
 * @template Data - The type of the outline data, extending IOutlineData.
 * @template Param - The type of the input param, extending IOutlineParam.
 * @param {OutlineName} outlineName - The unique name of the outline schema to process.
 * @param {Param} [param={}] - The input param to process, defaults to an empty object.
 * @returns {Promise<IOutlineResult<Data, Param>>} A promise resolving to the outline result, containing the processed data, history, and validation status.
 * @example
 * // Example usage
 * const result = await json<"MyOutline", { query: string }>("MyOutline", { query: "example" });
 * console.log(result.isValid, result.data); // Logs validation status and data
 */
export async function json<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
>(
  outlineName: OutlineName,
  param = {} as IOutlineParam
): Promise<IOutlineResult<Data, Param>> {
  return await jsonInternal(outlineName, param);
}
