import { IOutlineSchema } from "../../interfaces/Outline.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/**
 * Constant defining the method name for logging purposes.
 * Used to identify the operation in logs.
 * @private
 * @constant {string}
 */
const METHOD_NAME = "function.test.overrideOutline";

/**
 * Type definition for a partial outline schema, requiring an outline name and allowing optional properties from `IOutlineSchema`.
 * Used to specify the schema details for overriding an existing outline.
 * @typedef {Object} TOutlineSchema
 * @property {IOutlineSchema["outlineName"]} outlineName - The unique name of the outline to override.
 * @property {Partial<IOutlineSchema>} [partial] - Optional partial properties of the `IOutlineSchema` to override.
 */
type TOutlineSchema = {
  outlineName: IOutlineSchema["outlineName"];
} & Partial<IOutlineSchema>;

/**
 * Internal implementation of the outline override logic, wrapped in a clean context.
 * Updates the specified outline schema in the swarm's schema service and logs the operation if enabled.
 * @private
 * @param {TOutlineSchema} outlineSchema - The partial outline schema to apply.
 */
const overrideOutlineInternal = beginContext(
  (outlineSchema: TOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        outlineSchema,
      });

    return swarm.outlineSchemaService.override(
      outlineSchema.outlineName,
      outlineSchema
    );
  }
);

/**
 * Overrides an existing outline schema in the swarm system by updating it with the provided partial schema.
 * Ensures the operation runs in a clean context using `beginContext` to avoid interference from existing method or execution contexts.
 * Logs the operation if logging is enabled in the global configuration.
 * @param {TOutlineSchema} outlineSchema - The partial outline schema containing the outline name and optional schema properties to override.
 */
export function overrideOutline(outlineSchema: TOutlineSchema) {
  return overrideOutlineInternal(outlineSchema);
}
