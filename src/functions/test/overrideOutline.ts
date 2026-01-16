import { IOutlineData, IOutlineParam, IOutlineSchema } from "../../interfaces/Outline.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

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
 * @property {IOutlineSchema["outlineName"]} outlineName - The unique name of the outline to override.
 * @property {Partial<IOutlineSchema>} [partial] - Optional partial properties of the `IOutlineSchema` to override.
*/
type TOutlineSchema<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> = {
  outlineName: IOutlineSchema<Data, Param>["outlineName"];
} & Partial<IOutlineSchema<Data, Param>>;

/**
 * Internal implementation of the outline override logic, wrapped in a clean context.
 * Updates the specified outline schema in the swarm's schema service and logs the operation if enabled.
 * @private
*/
const overrideOutlineInternal = beginContext(
  async (publicOutlineSchema: TOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        outlineSchema: publicOutlineSchema,
      });

    await swarm.agentValidationService.validate(publicOutlineSchema.outlineName, METHOD_NAME);

    const outlineSchema = removeUndefined(publicOutlineSchema);

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
 *
 * @param outlineSchema Partial outline schema with updates to be applied to the existing outline configuration.
 * @param Param> The Param> parameter.
*/
export async function overrideOutline<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
>(outlineSchema: TOutlineSchema<Data, Param>) {
  return await overrideOutlineInternal(outlineSchema);
}
