import { ICompletionSchema } from "../../interfaces/Completion.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideCompletion";

type TCompletionSchema = {
  completionName: ICompletionSchema["completionName"];
} & Partial<ICompletionSchema>;

export const overrideCompletion = beginContext(
  (completionSchema: TCompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        completionSchema,
      });

    return swarm.completionSchemaService.override(
      completionSchema.completionName,
      completionSchema
    );
  }
);
