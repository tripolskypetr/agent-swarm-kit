import {
  IOutlineData,
  IOutlineParam,
  IOutlineSchema,
} from "../../interfaces/Outline.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/**
 * Constant defining the method name for logging purposes.
 * Used to identify the operation in logs.
 * @private
 * @constant {string}
 */
const METHOD_NAME = "function.setup.addOutline";

/**
 * Internal implementation of the outline addition logic, wrapped in a clean context.
 * Registers the outline schema with both the validation and schema services and logs the operation if enabled.
 * @private
 * @param {IOutlineSchema} outlineSchema - The outline schema to register.
 * @returns {string} The name of the registered outline.
 */
const addOutlineInternal = beginContext((outlineSchema: IOutlineSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      outlineSchema,
    });

  swarm.outlineValidationService.addOutline(
    outlineSchema.outlineName,
    outlineSchema
  );
  swarm.outlineSchemaService.register(outlineSchema.outlineName, outlineSchema);

  return outlineSchema.outlineName;
});

/**
 * Adds an outline schema to the swarm system by registering it with the outline validation and schema services.
 * Ensures the operation runs in a clean context using `beginContext` to avoid interference from existing method or execution contexts.
 * Logs the operation if logging is enabled in the global configuration.
 * @param {IOutlineSchema} outlineSchema - The outline schema to register, containing the outline name and configuration.
 * @returns {string} The name of the registered outline.
 */
export function addOutline<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
>(outlineSchema: IOutlineSchema<Data, Param>) {
  return addOutlineInternal(outlineSchema);
}
