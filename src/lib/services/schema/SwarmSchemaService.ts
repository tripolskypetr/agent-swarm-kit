import { ToolRegistry } from "functools-kit";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ISwarmSchema, SwarmName } from "../../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service class for managing swarm schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving ISwarmSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with SwarmConnectionService (swarm configuration for ClientSwarm), AgentConnectionService (agent list instantiation), PolicySchemaService (policy references), ClientAgent (swarm-coordinated execution), SessionConnectionService (session-swarm linking), and SwarmPublicService (public swarm API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining swarm configurations (e.g., agentList, defaultAgent, policies) used to orchestrate agents within the swarm ecosystem.
 */
export class SwarmSchemaService {
  /**
   * Logger service instance, injected via DI, for logging swarm schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SwarmConnectionService and PerfService logging patterns.
   * @type {LoggerService}
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Registry instance for storing swarm schemas, initialized with ToolRegistry from functools-kit.
   * Maps SwarmName keys to ISwarmSchema values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @type {ToolRegistry<Record<SwarmName, ISwarmSchema>>}
   * @private
   */
  private registry = new ToolRegistry<Record<SwarmName, ISwarmSchema>>(
    "swarmSchemaService"
  );

  /**
   * Validates a swarm schema shallowly, ensuring required fields and optional properties meet basic integrity constraints.
   * Checks swarmName and defaultAgent as strings, agentList as an array of unique strings (AgentName references), and policies, if present, as an array of unique strings (PolicyName references).
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SwarmConnectionService’s configuration needs.
   * Supports ClientSwarm instantiation in SwarmConnectionService by ensuring schema validity before registration.
   * @param {ISwarmSchema} swarmSchema - The swarm schema to validate, sourced from Swarm.interface.
   * @throws {Error} If any validation check fails, with detailed messages including swarmName and invalid values.
   * @private
   */
  private validateShallow = (swarmSchema: ISwarmSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmSchemaService validateShallow`, {
        swarmSchema,
      });
    if (typeof swarmSchema.swarmName !== "string") {
      throw new Error(
        `agent-swarm swarm schema validation failed: missing swarmName`
      );
    }
    if (typeof swarmSchema.defaultAgent !== "string") {
      throw new Error(
        `agent-swarm swarm schema validation failed: missing defaultAgent for swarmName=${swarmSchema.swarmName}`
      );
    }
    if (!Array.isArray(swarmSchema.agentList)) {
      throw new Error(
        `agent-swarm swarm schema validation failed: missing agentList for swarmName=${swarmSchema.swarmName} value=${swarmSchema.agentList}`
      );
    }
    if (
      swarmSchema.agentList.length !== new Set(swarmSchema.agentList).size
    ) {
      throw new Error(
        `agent-swarm swarm schema validation failed: found duplicate agentList for swarmName=${swarmSchema.swarmName} agentList=[${swarmSchema.agentList}]`
      );
    }
    if (swarmSchema.agentList.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm swarm schema validation failed: invalid agentList for swarmName=${swarmSchema.swarmName} value=[${swarmSchema.agentList}]`
      );
    }
    if (swarmSchema.policies && !Array.isArray(swarmSchema.policies)) {
      throw new Error(
        `agent-swarm swarm schema validation failed: invalid policies for swarmName=${swarmSchema.swarmName} value=${swarmSchema.policies}`
      );
    }
    if (
      swarmSchema.policies &&
      swarmSchema.policies.length !== new Set(swarmSchema.policies).size
    ) {
      throw new Error(
        `agent-swarm swarm schema validation failed: found duplicate policies for swarmName=${swarmSchema.swarmName} policies=[${swarmSchema.policies}]`
      );
    }
    if (
      swarmSchema.policies?.some((value) => typeof value !== "string")
    ) {
      throw new Error(
        `agent-swarm swarm schema validation failed: invalid policies for swarmName=${swarmSchema.swarmName} value=[${swarmSchema.policies}]`
      );
    }
  };

  /**
   * Registers a new swarm schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (swarmName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SwarmConnectionService’s swarm management.
   * Supports ClientAgent execution by providing validated swarm schemas to SwarmConnectionService for ClientSwarm configuration.
   * @param {SwarmName} key - The name of the swarm, used as the registry key, sourced from Swarm.interface.
   * @param {ISwarmSchema} value - The swarm schema to register, sourced from Swarm.interface, validated before storage.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
   */
  public register = (key: SwarmName, value: ISwarmSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a swarm schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports SwarmConnectionService by providing swarm configuration (e.g., agentList, defaultAgent, policies) for ClientSwarm instantiation, linking to AgentConnectionService and PolicySchemaService.
   * @param {SwarmName} key - The name of the swarm to retrieve, sourced from Swarm.interface.
   * @returns {ISwarmSchema} The swarm schema associated with the key, sourced from Swarm.interface, including agentList, defaultAgent, and optional policies.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
   */
  public get = (key: SwarmName): ISwarmSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the SwarmSchemaService class.
 * Provides the primary service for managing swarm schemas in the swarm system, integrating with SwarmConnectionService, AgentConnectionService, PolicySchemaService, ClientAgent, SessionConnectionService, and SwarmPublicService, with validated schema storage via ToolRegistry.
 * @type {typeof SwarmSchemaService}
 */
export default SwarmSchemaService;
