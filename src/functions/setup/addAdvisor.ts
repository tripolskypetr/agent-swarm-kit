import { IAdvisorSchema } from "../../interfaces/Advisor.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/** @constant {string} METHOD_NAME - The name of the method used for logging*/
const METHOD_NAME = "function.setup.addAdvisor";

/**
 * Function implementation
*/
const addAdvisorInternal = beginContext(
  (advisorSchema: IAdvisorSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        advisorSchema,
      });

    swarm.advisorValidationService.addAdvisor(
      advisorSchema.advisorName,
      advisorSchema,
    );
    swarm.advisorSchemaService.register(
      advisorSchema.advisorName,
      advisorSchema
    );

    return advisorSchema.advisorName;
  }
);

/**
 * Adds an advisor schema to the system
 * @function addAdvisor
 * @param {IAdvisorSchema} advisorSchema - The schema definition for advisor.
*/
export function addAdvisor(advisorSchema: IAdvisorSchema) {
  return addAdvisorInternal(advisorSchema);
}
