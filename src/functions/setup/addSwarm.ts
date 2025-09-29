import { ISwarmSchema } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addSwarm";

/**
 * Function implementation
 */
const addSwarmInternal = beginContext((swarmSchema: ISwarmSchema) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmSchema,
    });

  // Register the swarm in the validation and schema services
  swarm.swarmValidationService.addSwarm(swarmSchema.swarmName, swarmSchema);
  swarm.swarmSchemaService.register(swarmSchema.swarmName, swarmSchema);

  // Return the swarm's name as confirmation of registration
  return swarmSchema.swarmName;
});


/**
 * Adds a new swarm to the system for managing client sessions.
 *
 * This function registers a new swarm, which serves as the root entity for initiating and managing client sessions within the system.
 * The swarm defines the structure and behavior of agent interactions and session workflows. Only swarms registered through this function
 * are recognized by the system. The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts,
 * providing a clean execution environment. The function logs the operation if enabled and returns the swarm's name upon successful registration.
 *
 *
 * @param {ISwarmSchema} swarmSchema - The schema definition for swarm.
 * @throws {Error} If the swarm schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate swarm name).
 * @example
 * const swarmSchema = { swarmName: "TaskSwarm", defaultAgent: "AgentX" };
 * const swarmName = addSwarm(swarmSchema);
 * console.log(swarmName); // Outputs "TaskSwarm"
 */
export function addSwarm(swarmSchema: ISwarmSchema) {
  return addSwarmInternal(swarmSchema);
}
