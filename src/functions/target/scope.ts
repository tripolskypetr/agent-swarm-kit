/**
 * @module scope
 * @description Provides a function to execute a specified function within a managed schema context, allowing overrides for schema services.
 */

import { GLOBAL_CONFIG } from "src/config/params";
import swarm from "../../lib";
import SchemaContextService, {
  ISchemaContext,
} from "../../lib/services/context/SchemaContextService";

/**
 * @constant {string} METHOD_NAME
 * @description Method name for the scope operation.
 * @private
 */
const METHOD_NAME = "function.target.scope";

/**
 * @function scope
 * @description Executes a provided function within a schema context, with optional overrides for schema services such as agents, completions, and pipelines.
 * @template T - Type of the result returned by the run function.
 * @param {Function} runFn - The function to execute within the schema context.
 * @param {Partial<ISchemaContext["registry"]>} [options] - Optional overrides for schema services, with defaults from the swarm's schema services.
 * @param {ToolRegistry} [options.agentSchemaService=swarm.agentSchemaService.registry] - Registry for agent schemas.
 * @param {ToolRegistry} [options.completionSchemaService=swarm.completionSchemaService.registry] - Registry for completion schemas.
 * @param {ToolRegistry} [options.computeSchemaService=swarm.computeSchemaService.registry] - Registry for compute schemas.
 * @param {ToolRegistry} [options.embeddingSchemaService=swarm.embeddingSchemaService.registry] - Registry for embedding schemas.
 * @param {ToolRegistry} [options.mcpSchemaService=swarm.mcpSchemaService.registry] - Registry for MCP schemas.
 * @param {ToolRegistry} [options.pipelineSchemaService=swarm.pipelineSchemaService.registry] - Registry for pipeline schemas.
 * @param {ToolRegistry} [options.policySchemaService=swarm.policySchemaService.registry] - Registry for policy schemas.
 * @param {ToolRegistry} [options.stateSchemaService=swarm.stateSchemaService.registry] - Registry for state schemas.
 * @param {ToolRegistry} [options.storageSchemaService=swarm.storageSchemaService.registry] - Registry for storage schemas.
 * @param {ToolRegistry} [options.swarmSchemaService=swarm.swarmSchemaService.registry] - Registry for swarm schemas.
 * @param {ToolRegistry} [options.toolSchemaService=swarm.toolSchemaService.registry] - Registry for tool schemas.
 * @param {ToolRegistry} [options.wikiSchemaService=swarm.wikiSchemaService.registry] - Registry for wiki schemas.
 * @returns {Promise<T>} The result of the executed function.
 */
export const scope = async <T = any>(
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
    wikiSchemaService = swarm.wikiSchemaService.registry,
  }: Partial<ISchemaContext["registry"]>
): Promise<T> => {
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
      wikiSchemaService,
    },
  });
};
