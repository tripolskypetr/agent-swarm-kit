import { IAgentSchema, IAgentSchemaInternal } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import mapAgentSchema from "../../helpers/mapAgentSchema";

const METHOD_NAME = "function.setup.addAgent";

/**
 * Function implementation
 */
const addAgentInternal = beginContext((publicAgentSchema: IAgentSchema) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      agentSchema: publicAgentSchema,
    });

  const agentSchema = mapAgentSchema(publicAgentSchema);

  // Register the agent in the validation and schema services
  swarm.agentValidationService.addAgent(agentSchema.agentName, agentSchema);
  swarm.agentSchemaService.register(agentSchema.agentName, agentSchema);

  // Return the agent's name as confirmation of registration
  return agentSchema.agentName;
});

/**
 * Adds a new agent to the agent registry for use within the swarm system.
 *
 * This function registers a new agent by adding it to the agent validation and schema services, making it available for swarm operations.
 * Only agents registered through this function can be utilized by the swarm. The execution is wrapped in `beginContext` to ensure it runs
 * outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
 * and returns the agent's name upon successful registration.
 *
 * @throws {Error} If the agent schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate agent name).
 * @example
 * const agentSchema = { agentName: "AgentX", prompt: "Handle tasks" };
 * const agentName = addAgent(agentSchema);
 * console.log(agentName); // Outputs "AgentX"
 */
export function addAgent(agentSchema: IAgentSchema) {
  return addAgentInternal(agentSchema);
}
