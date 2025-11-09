import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import {
  IOutlineArgs,
  IOutlineParam,
  IOutlineData,
  IOutlineHistory,
  OutlineName,
  IOutlineValidationArgs,
  IOutlineResult,
} from "../../interfaces/Outline.interface";
import { ICompletionSchema } from "../../interfaces/Completion.interface";
import { getErrorMessage, randomString } from "functools-kit";
import { errorSubject } from "../../config/emitters";
import { ISwarmMessage } from "../../contract/SwarmMessage.contract";
import { IOutlineMessage } from "../../contract/OutlineMessage.contract";
import { IOutlineCompletionArgs } from "../../contract/OutlineCompletion.contract";

const METHOD_NAME = "function.target.json";

const MAX_ATTEMPTS = 5;

/**
 * A class implementing the IOutlineHistory interface to manage a history of outline messages.
 * Provides methods to append, clear, and retrieve messages for tracking interactions in an outline process.
 * @class
 * @implements {IOutlineHistory }
*/
class OutlineHistory implements IOutlineHistory {
  /** @private*/
  private messages: IOutlineMessage[] = [];

  /**
   * Appends one or more messages to the history.
   * Flattens nested arrays of messages and adds them to the internal message list.
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
   */
  async clear(): Promise<void> {
    this.messages = [];
  }

  /**
   * Retrieves a copy of all messages in the history.
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
*/
const jsonInternal = beginContext(
  async (
    outlineName: OutlineName,
    param: IOutlineParam
  ): Promise<IOutlineResult> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {});

    swarm.outlineValidationService.validate(outlineName, METHOD_NAME);

    const resultId = randomString();
    const clientId = `${resultId}_outline`;

    const {
      getOutlineHistory,
      completion,
      validations = [],
      maxAttempts = MAX_ATTEMPTS,
      format,
      prompt,
      system,
      callbacks: outlineCallbacks,
    } = swarm.outlineSchemaService.get(outlineName);

    swarm.completionValidationService.validate(completion, METHOD_NAME);

    const completionSchema: ICompletionSchema<IOutlineMessage> = swarm.completionSchemaService.get(completion);

    const {
      getCompletion,
      flags = [],
      callbacks: completionCallbacks,
    } = completionSchema;

    let errorMessage: string = "";
    let history: OutlineHistory;

    const modelPrompt =
      typeof prompt === "function" ? await prompt(outlineName) : prompt;

    const systemPrompt =
      typeof system === "function" ? await system(outlineName) : system;

    const makeHistory = async () => {
      history = new OutlineHistory();
      if (modelPrompt) {
        await history.push({
          role: "system",
          content: modelPrompt,
        });
      }
      for (const system of systemPrompt ?? []) {
        await history.push({
          role: "system",
          content: system,
        });
      }
      for (const flag of flags) {
        await history.push({
          role: "system",
          content: flag,
        });
      }
    };

    let lastData: unknown = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await makeHistory();
      const inputArgs: IOutlineArgs = {
        attempt,
        format,
        param,
        history,
      };
      if (outlineCallbacks?.onAttempt) {
        outlineCallbacks.onAttempt(inputArgs);
      }
      await getOutlineHistory(inputArgs);
      const messages = await history.list();
      try {
        let output: ISwarmMessage | IOutlineMessage;
        let errorValue = null;

        const unError = errorSubject.subscribe(([errorClientId, error]) => {
          if (clientId === errorClientId) {
            errorValue = error;
          }
        });

        output = await getCompletion({
          clientId,
          messages: await history.list(),
          outlineName,
          format,
        });

        unError();

        if (errorValue) {
          throw errorValue;
        }

        if (completionCallbacks?.onComplete) {
          completionCallbacks.onComplete<IOutlineCompletionArgs>(
            {
              messages,
              outlineName,
              format,
              clientId,
            },
            output
          );
        }
        const data = JSON.parse(output.content) as IOutlineData;
        {
          lastData = data;
        }
        const validationArgs: IOutlineValidationArgs = {
          ...inputArgs,
          data,
        };
        for (const validation of validations) {
          const validate =
            typeof validation === "object" ? validation.validate : validation;
          await validate(validationArgs);
        }
        const result = {
          isValid: true,
          attempt,
          param,
          history: await history.list(),
          data,
          resultId,
        };
        if (outlineCallbacks?.onValidDocument) {
          outlineCallbacks.onValidDocument(result);
        }
        return result;
      } catch (error) {
        errorMessage = getErrorMessage(error);
        console.error(
          `agent-swarm outline error outlineName=${outlineName} attempt=${attempt}`,
          {
            param,
            lastData,
            errorMessage,
          }
        );
      }
    }
    const result = {
      isValid: false,
      error: errorMessage ?? "Unknown error",
      attempt: maxAttempts,
      param,
      history: await history.list(),
      data: null,
      resultId,
    };
    if (outlineCallbacks?.onInvalidDocument) {
      outlineCallbacks.onInvalidDocument(result);
    }
    return result;
  }
);

/**
 * Processes an outline request to generate structured JSON data based on a specified outline schema.
 * Delegates to an internal context-isolated function to ensure clean execution.
 * @async
 *
 * @param outlineName The outlineName parameter.
 * @param param The param parameter.
 * @template Data - The type of the outline data, extending IOutlineData.
 * @template Param - The type of the input param, extending IOutlineParam.
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
