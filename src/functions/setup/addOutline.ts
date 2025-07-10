import { IOutlineSchema } from "../../interfaces/Outline.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addOutline";

const addOutlineInternal = beginContext(
  (outlineSchema: IOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        outlineSchema,
      });

    swarm.outlineValidationService.addOutline(
      outlineSchema.outlineName,
      outlineSchema,
    );
    swarm.outlineSchemaService.register(
      outlineSchema.outlineName,
      outlineSchema
    );

    return outlineSchema.outlineName;
  }
);

export function addOutline(outlineSchema: IOutlineSchema) {
  return addOutlineInternal(outlineSchema);
}