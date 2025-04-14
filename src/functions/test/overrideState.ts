import { IStateSchema } from "../../interfaces/State.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideState";

type TStateSchema<T extends unknown = any> = {
  stateName: IStateSchema<T>["stateName"];
} & Partial<IStateSchema<T>>;

export const overrideState = beginContext((stateSchema: TStateSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      stateSchema,
    });

  return swarm.stateSchemaService.override(stateSchema.stateName, stateSchema);
}) as <T extends unknown = any>(
  stateSchema: TStateSchema<T>
) => IStateSchema<T>;
