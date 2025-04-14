import { IPolicySchema } from "../../interfaces/Policy.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overridePolicy";

type TPolicySchema = {
  policyName: IPolicySchema['policyName'];
} & Partial<IPolicySchema>;

export const overridePolicy = beginContext((policySchema: TPolicySchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      policySchema,
    });

  return swarm.policySchemaService.override(policySchema.policyName, policySchema);
});
