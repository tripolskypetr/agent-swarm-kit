/**
 * @module scope
 * Provides a function to execute a specified function within a managed schema context, allowing overrides for schema services.
*/

import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import SchemaContextService, {
  ISchemaContext,
} from "../../lib/services/context/SchemaContextService";
import beginContext from "../../utils/beginContext";

/**
 * @constant {string} METHOD_NAME
 * Method name for the scope operation.
 * @private
*/
const METHOD_NAME = "function.target.scope";

/**
 * Optional overrides for schema services used within the schema context.
 * Allows partial customization of the schema registry.
*/
type ScopeOptions = Partial<ISchemaContext["registry"]>;

/**
 * Function implementation
*/
const scopeInternal = beginContext(
  async <T = any>(
    runFn: () => Promise<T | void>,
    {
      agentSchemaService = swarm.agentSchemaService.registry,
      completionSchemaService = swarm.completionSchemaService.registry,
      computeSchemaService = swarm.computeSchemaService.registry,
      embeddingSchemaService = swarm.embeddingSchemaService.registry,
      mcpSchemaService = swarm.mcpSchemaService.registry,
      pipelineSchemaService = swarm.pipelineSchemaService.registry,
      policySchemaService = swarm.policySchemaService.registry,
      stateSchemaService = swarm.stateSchemaService.registry,
      storageSchemaService = swarm.storageSchemaService.registry,
      swarmSchemaService = swarm.swarmSchemaService.registry,
      toolSchemaService = swarm.toolSchemaService.registry,
      advisorSchemaService = swarm.advisorSchemaService.registry,
      outlineSchemaService = swarm.outlineSchemaService.registry,
    }: ScopeOptions = {}
  ): Promise<any> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);
    return await SchemaContextService.runInContext(runFn as () => Promise<T>, {
      registry: {
        agentSchemaService,
        completionSchemaService,
        computeSchemaService,
        embeddingSchemaService,
        mcpSchemaService,
        pipelineSchemaService,
        policySchemaService,
        stateSchemaService,
        storageSchemaService,
        swarmSchemaService,
        toolSchemaService,
        advisorSchemaService,
        outlineSchemaService,
      },
    });
  }
);

/**
 * Executes a provided function within a schema context, with optional overrides for schema services such as agents, completions, and pipelines.
 *
 * @param runFn Function to execute within the managed scope, receiving clientId and agentName as arguments.
 * @param options Configuration options for schema service overrides.
 * @template T - Type of the result returned by the run function.
*/
export async function scope<T = any>(
  runFn: () => Promise<T | void>,
  options?: ScopeOptions
): Promise<T> {
  return await scopeInternal(runFn, options);
}
