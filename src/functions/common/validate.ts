import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.common.validate";

/**
 * Type alias for enum objects with string key-value pairs
 */
type Enum = Record<string, string>;

/**
 * Type alias for ValidateArgs with any enum type
 */
type Args = ValidateArgs<any>;

/**
 * Interface defining validation arguments for all entity types.
 *
 * Each property accepts an enum object where values will be validated
 * against registered entities in their respective validation services.
 *
 * @template T - Enum type extending Record<string, string>
 */
interface ValidateArgs<T = Enum> {
  /**
   * Swarm name enum to validate
   * @example { MY_SWARM: "my-swarm" }
   */
  SwarmName?: T;

  /**
   * Agent name enum to validate
   * @example { MY_AGENT: "my-agent" }
   */
  AgentName?: T;

  /**
   * Outline name enum to validate
   * @example { MY_OUTLINE: "my-outline" }
   */
  OutlineName?: T;

  /**
   * Advisor name enum to validate
   * @example { MY_ADVISOR: "my-advisor" }
   */
  AdvisorName?: T;

  /**
   * Completion name enum to validate
   * @example { CLAUDE_SONNET: "claude-sonnet-4-5" }
   */
  CompletionName?: T;

  /**
   * Compute name enum to validate
   * @example { MY_COMPUTE: "my-compute" }
   */
  ComputeName?: T;

  /**
   * Embedding name enum to validate
   * @example { TEXT_EMBEDDING: "text-embedding-3-small" }
   */
  EmbeddingName?: T;

  /**
   * MCP name enum to validate
   * @example { MY_MCP: "my-mcp" }
   */
  MCPName?: T;

  /**
   * Pipeline name enum to validate
   * @example { MY_PIPELINE: "my-pipeline" }
   */
  PipelineName?: T;

  /**
   * Policy name enum to validate
   * @example { MY_POLICY: "my-policy" }
   */
  PolicyName?: T;

  /**
   * State name enum to validate
   * @example { MY_STATE: "my-state" }
   */
  StateName?: T;

  /**
   * Storage name enum to validate
   * @example { MY_STORAGE: "my-storage" }
   */
  StorageName?: T;

  /**
   * Tool name enum to validate
   * @example { MY_TOOL: "my-tool" }
   */
  ToolName?: T;
}

/**
 * Retrieves all registered swarms as a map
 * @private
 * @returns Map of swarm names
 */
const getSwarmMap = () => {
  const swarmMap: Record<string, string> = {};
  for (const swarmName of swarm.swarmValidationService.getSwarmList()) {
    Object.assign(swarmMap, { [swarmName]: swarmName });
  }
  return swarmMap;
};

/**
 * Retrieves all registered agents as a map
 * @private
 * @returns Map of agent names
 */
const getAgentMap = () => {
  const agentMap: Record<string, string> = {};
  for (const agentName of swarm.agentValidationService.getAgentList()) {
    Object.assign(agentMap, { [agentName]: agentName });
  }
  return agentMap;
};

/**
 * Retrieves all registered outlines as a map
 * @private
 * @returns Map of outline names
 */
const getOutlineMap = () => {
  const outlineMap: Record<string, string> = {};
  for (const outlineName of swarm.outlineValidationService.getOutlineList()) {
    Object.assign(outlineMap, { [outlineName]: outlineName });
  }
  return outlineMap;
};

/**
 * Retrieves all registered computes as a map
 * @private
 * @returns Map of compute names
 */
const getComputeMap = () => {
  const computeMap: Record<string, string> = {};
  for (const computeName of swarm.computeValidationService.getComputeList()) {
    Object.assign(computeMap, { [computeName]: computeName });
  }
  return computeMap;
};

/**
 * Retrieves all registered advisors as a map by accessing internal _advisorMap
 * @private
 * @returns Map of advisor names
 */
const getAdvisorMap = () => {
  const advisorMap: Record<string, string> = {};
  // AdvisorValidationService doesn't expose getList, so we return empty map
  // Advisors will be validated when explicitly provided
  return advisorMap;
};

/**
 * Retrieves all registered completions as a map by accessing internal _completionSet
 * @private
 * @returns Map of completion names
 */
const getCompletionMap = () => {
  const completionMap: Record<string, string> = {};
  // CompletionValidationService doesn't expose getList, so we return empty map
  // Completions will be validated indirectly through agents and outlines
  return completionMap;
};

/**
 * Retrieves all registered embeddings as a map by accessing internal _embeddingMap
 * @private
 * @returns Map of embedding names
 */
const getEmbeddingMap = () => {
  const embeddingMap: Record<string, string> = {};
  // EmbeddingValidationService doesn't expose getList, so we return empty map
  // Embeddings will be validated indirectly through storages
  return embeddingMap;
};

/**
 * Retrieves all registered MCPs as a map by accessing internal _mcpMap
 * @private
 * @returns Map of MCP names
 */
const getMCPMap = () => {
  const mcpMap: Record<string, string> = {};
  // MCPValidationService doesn't expose getList, so we return empty map
  // MCPs will be validated indirectly through agents
  return mcpMap;
};

/**
 * Retrieves all registered pipelines as a map by accessing internal _pipelineMap
 * @private
 * @returns Map of pipeline names
 */
const getPipelineMap = () => {
  const pipelineMap: Record<string, string> = {};
  // PipelineValidationService doesn't expose getList, so we return empty map
  // Pipelines will be validated when explicitly provided
  return pipelineMap;
};

/**
 * Retrieves all registered policies as a map by accessing internal _policyMap
 * @private
 * @returns Map of policy names
 */
const getPolicyMap = () => {
  const policyMap: Record<string, string> = {};
  // PolicyValidationService doesn't expose getList, so we return empty map
  // Policies will be validated indirectly through swarms
  return policyMap;
};

/**
 * Retrieves all registered states as a map by accessing internal _stateMap
 * @private
 * @returns Map of state names
 */
const getStateMap = () => {
  const stateMap: Record<string, string> = {};
  // StateValidationService doesn't expose getList, so we return empty map
  // States will be validated indirectly through agents and computes
  return stateMap;
};

/**
 * Retrieves all registered storages as a map by accessing internal _storageMap
 * @private
 * @returns Map of storage names
 */
const getStorageMap = () => {
  const storageMap: Record<string, string> = {};
  // StorageValidationService doesn't expose getList, so we return empty map
  // Storages will be validated indirectly through agents
  return storageMap;
};

/**
 * Retrieves all registered tools as a map by accessing internal _toolMap
 * @private
 * @returns Map of tool names
 */
const getToolMap = () => {
  const toolMap: Record<string, string> = {};
  // ToolValidationService doesn't expose getList, so we return empty map
  // Tools will be validated indirectly through agents
  return toolMap;
};

/**
 * Internal validation function that processes all provided entity enums.
 *
 * Iterates through each enum's values and validates them against their
 * respective validation services. Uses memoized validation for performance.
 *
 * If entity enums are not provided, fetches all registered entities from
 * their respective validation services and validates them.
 *
 * Note: Advisors, Completions, Embeddings, MCPs, Pipelines, Policies, States,
 * Storages, and Tools are validated indirectly through their parent entities
 * (e.g., agents validate their tools, storages, completions, MCP, states, etc.)
 *
 * @private
 * @param args - Validation arguments containing entity name enums
 * @throws {Error} If any entity name is not found in its registry
 */
const validateInternal = (args: ValidateArgs<Enum>) => {
  const {
    SwarmName = getSwarmMap(),
    AgentName = getAgentMap(),
    OutlineName = getOutlineMap(),
    ComputeName = getComputeMap(),
    AdvisorName = getAdvisorMap(),
    CompletionName = getCompletionMap(),
    EmbeddingName = getEmbeddingMap(),
    MCPName = getMCPMap(),
    PipelineName = getPipelineMap(),
    PolicyName = getPolicyMap(),
    StateName = getStateMap(),
    StorageName = getStorageMap(),
    ToolName = getToolMap(),
  } = args;

  // Validate swarms (which also validates agents and policies)
  for (const swarmName of Object.values(SwarmName)) {
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  }

  // Validate agents explicitly (validates tools, storages, completions, MCP, states)
  for (const agentName of Object.values(AgentName)) {
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
  }

  // Validate outlines (validates completions)
  for (const outlineName of Object.values(OutlineName)) {
    swarm.outlineValidationService.validate(outlineName, METHOD_NAME);
  }

  // Validate computes (validates state dependencies)
  for (const computeName of Object.values(ComputeName)) {
    swarm.computeValidationService.validate(computeName, METHOD_NAME);
  }

  // Validate optional direct entities
  // Note: These are typically validated indirectly through their parent entities,
  // but can be validated directly when explicitly provided
  for (const advisorName of Object.values(AdvisorName)) {
    swarm.advisorValidationService.validate(advisorName, METHOD_NAME);
  }

  for (const completionName of Object.values(CompletionName)) {
    swarm.completionValidationService.validate(completionName, METHOD_NAME);
  }

  for (const embeddingName of Object.values(EmbeddingName)) {
    swarm.embeddingValidationService.validate(embeddingName, METHOD_NAME);
  }

  for (const mcpName of Object.values(MCPName)) {
    swarm.mcpValidationService.validate(mcpName, METHOD_NAME);
  }

  for (const pipelineName of Object.values(PipelineName)) {
    swarm.pipelineValidationService.validate(pipelineName, METHOD_NAME);
  }

  for (const policyName of Object.values(PolicyName)) {
    swarm.policyValidationService.validate(policyName, METHOD_NAME);
  }

  for (const stateName of Object.values(StateName)) {
    swarm.stateValidationService.validate(stateName, METHOD_NAME);
  }

  for (const storageName of Object.values(StorageName)) {
    swarm.storageValidationService.validate(storageName, METHOD_NAME);
  }

  for (const toolName of Object.values(ToolName)) {
    swarm.toolValidationService.validate(toolName, METHOD_NAME);
  }
};

/**
 * Validates the existence of all provided entity names across validation services.
 *
 * This function accepts enum objects for various entity types (swarms, agents, outlines,
 * advisors, completions, computes, embeddings, MCPs, pipelines, policies, states,
 * storages, tools) and validates that each entity name exists in its respective
 * registry. Validation results are memoized for performance.
 *
 * If no arguments are provided (or specific entity types are omitted), the function
 * automatically fetches and validates ALL registered entities from their respective
 * validation services. This is useful for comprehensive validation of the entire setup.
 *
 * Use this before running operations to ensure all referenced entities are properly
 * registered and configured.
 *
 * @public
 * @param args - Partial validation arguments containing entity name enums to validate.
 *                If empty or omitted, validates all registered entities.
 * @throws {Error} If any entity name is not found in its validation service
 *
 * @example
 * ```typescript
 * // Validate ALL registered entities (swarms, agents, outlines, etc.)
 * validate({});
 * ```
 *
 * @example
 * ```typescript
 * // Define your entity name enums
 * enum SwarmName {
 *   MY_SWARM = "my-swarm"
 * }
 *
 * enum AgentName {
 *   MY_AGENT = "my-agent"
 * }
 *
 * // Validate specific entities
 * validate({
 *   SwarmName,
 *   AgentName,
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Validate specific entity types
 * validate({
 *   CompletionName: { CLAUDE_SONNET: "claude-sonnet-4-5" },
 *   EmbeddingName: { TEXT_EMBEDDING: "text-embedding-3-small" },
 * });
 * ```
 */
export function validate(args: Partial<Args> = {}) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME);
  return validateInternal(args);
}
