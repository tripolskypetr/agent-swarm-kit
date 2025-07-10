import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import {
  IOutlineArgs,
  IOutlineData,
  IOutlineOutput,
  IOutlineHistory,
  OutlineName,
  IOutlineMessage,
  IOutlineValidationArgs,
  IOutlineResult,
} from "../../interfaces/Outline.interface";
import { getErrorMessage, randomString } from "functools-kit";

const METHOD_NAME = "function.target.json";

const MAX_ATTEMPTS = 5;

class OutlineHistory implements IOutlineHistory {
  private messages: IOutlineMessage[] = [];

  async push(
    ...messages: (IOutlineMessage | IOutlineMessage[])[]
  ): Promise<void> {
    const flattenedMessages = messages.flat();
    this.messages.push(...flattenedMessages);
  }

  async clear(): Promise<void> {
    this.messages = [];
  }

  async list(): Promise<IOutlineMessage[]> {
    return [...this.messages];
  }
}

const jsonInternal = beginContext(
  async (
    outlineName: OutlineName,
    data: IOutlineData
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

    let errorMessage = "";
    let history: OutlineHistory;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      history = new OutlineHistory();
      const inputArgs: IOutlineArgs = {
        attempt,
        data,
        history,
      };
      if (callbacks?.onAttempt) {
        callbacks.onAttempt(inputArgs);
      }
      const output = await getStructuredOutput(inputArgs);
      const validationArgs: IOutlineValidationArgs = {
        ...inputArgs,
        output,
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
        data,
        history: await history.list(),
        output,
        resultId,
      };
    }

    return {
      isValid: false,
      error: errorMessage ?? "Unknown error",
      attempt: maxAttempts,
      data,
      history: await history.list(),
      output: null,
      resultId,
    };
  }
);

export async function json<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
>(
  outlineName: OutlineName,
  data = {} as IOutlineData
): Promise<IOutlineResult<Output, Data>> {
  return await jsonInternal(outlineName, data);
}
