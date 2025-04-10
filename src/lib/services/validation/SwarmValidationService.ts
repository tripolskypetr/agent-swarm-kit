import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SwarmName, ISwarmSchema } from "../../../interfaces/Swarm.interface";
import AgentValidationService from "./AgentValidationService";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import PolicyValidationService from "./PolicyValidationService";

/**
 * Service for validating swarm configurations within the swarm system.
 * Manages a map of registered swarms, ensuring their uniqueness, existence, valid agent lists, default agents, and policies.
 * Integrates with SwarmSchemaService (swarm registration), ClientSwarm (swarm operations),
 * AgentValidationService (agent validation), PolicyValidationService (policy validation),
 * SessionValidationService (session-swarm mapping), and LoggerService (logging).
 * Uses dependency injection for services and memoization for efficient validation checks.
 */
export class SwarmValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @type {LoggerService}
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Agent validation service instance for validating agents associated with swarms.
   * Injected via DI, used in validate method to check swarm.agentList.
   * @type {AgentValidationService}
   * @private
   * @readonly
   */
  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  /**
   * Policy validation service instance for validating policies associated with swarms.
   * Injected via DI, used in validate method to check swarm.policies.
   * @type {PolicyValidationService}
   * @private
   * @readonly
   */
  private readonly policyValidationService = inject<PolicyValidationService>(
    TYPES.policyValidationService
  );

  /**
   * Map of swarm names to their schemas, used to track and validate swarms.
   * Populated by addSwarm, queried by getAgentList, getPolicyList, and validate.
   * @type {Map<SwarmName, ISwarmSchema>}
   * @private
   */
  private _swarmMap = new Map<SwarmName, ISwarmSchema>();

  /**
   * Registers a new swarm with its schema in the validation service.
   * Logs the operation and ensures uniqueness, supporting SwarmSchemaService’s registration process.
   * @param {SwarmName} swarmName - The name of the swarm to add, sourced from Swarm.interface.
   * @param {ISwarmSchema} swarmSchema - The schema defining the swarm’s configuration (e.g., agentList, defaultAgent, policies), sourced from Swarm.interface.
   * @throws {Error} If the swarm name already exists in _swarmMap.
   */
  public addSwarm = (swarmName: SwarmName, swarmSchema: ISwarmSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService addSwarm", {
        swarmName,
        swarmSchema,
      });
    if (this._swarmMap.has(swarmName)) {
      throw new Error(`agent-swarm swarm ${swarmName} already exist`);
    }
    this._swarmMap.set(swarmName, swarmSchema);
  };

  /**
   * Retrieves the list of agent names associated with a given swarm.
   * Logs the operation and validates swarm existence, supporting ClientSwarm’s agent management.
   * @param {SwarmName} swarmName - The name of the swarm to query, sourced from Swarm.interface.
   * @returns {string[]} An array of agent names from the swarm’s schema.
   * @throws {Error} If the swarm is not found in _swarmMap.
   */
  public getAgentList = (swarmName: SwarmName): string[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService getAgentList", {
        swarmName,
      });
    const swarm = this._swarmMap.get(swarmName);
    if (!swarm) {
      throw new Error(`agent-swarm swarm ${swarmName} not found`);
    }
    return swarm.agentList;
  };

  /**
   * Retrieves the set of agent names associated with a given swarm.
   * Logs the operation and validates swarm existence, supporting ClientSwarm’s agent management.
   * @param {SwarmName} swarmName - The name of the swarm to query, sourced from Swarm.interface.
   * @returns {string[]} An array of agent names from the swarm’s schema.
   * @throws {Error} If the swarm is not found in _swarmMap.
   */
  public getAgentSet = memoize(
    ([swarmName]) => `${swarmName}`,
    (swarmName: SwarmName): Set<string> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("swarmValidationService getAgentSet", {
          swarmName,
        });
      const swarm = this._swarmMap.get(swarmName);
      if (!swarm) {
        throw new Error(`agent-swarm swarm ${swarmName} not found`);
      }
      return new Set(swarm.agentList);
    }
  );

  /**
   * Retrieves the list of policy names associated with a given swarm.
   * Logs the operation and validates swarm existence, supporting ClientSwarm’s policy enforcement.
   * @param {SwarmName} swarmName - The name of the swarm to query, sourced from Swarm.interface.
   * @returns {string[]} An array of policy names from the swarm’s schema, or empty array if none.
   * @throws {Error} If the swarm is not found in _swarmMap.
   */
  public getPolicyList = (swarmName: SwarmName): string[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService getPolicyList", {
        swarmName,
      });
    const swarm = this._swarmMap.get(swarmName);
    if (!swarm) {
      throw new Error(`agent-swarm swarm ${swarmName} not found`);
    }
    return swarm.policies ?? [];
  };

  /**
   * Retrieves the list of all registered swarm names.
   * Logs the operation, supporting SwarmSchemaService’s swarm enumeration.
   * @returns {string[]} An array of all swarm names from _swarmMap.
   */
  public getSwarmList = (): string[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService getSwarmList");
    return [...this._swarmMap.keys()];
  };

  /**
   * Validates a swarm by its name and source, memoized by swarmName for performance.
   * Checks swarm existence, default agent inclusion, and validates all agents and policies.
   * Logs the operation, supporting ClientSwarm’s operational integrity.
   * @param {SwarmName} swarmName - The name of the swarm to validate, sourced from Swarm.interface.
   * @param {string} source - The source of the validation request (e.g., "swarm-init"), for error context.
   * @throws {Error} If the swarm is not found, the default agent is not in the agent list, or any agent/policy validation fails.
   */
  public validate = memoize(
    ([swarmName]) => swarmName,
    (swarmName: SwarmName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("swarmValidationService validate", {
          swarmName,
          source,
        });
      const swarm = this._swarmMap.get(swarmName);
      if (!swarm) {
        throw new Error(`agent-swarm swarm ${swarmName} not found`);
      }
      if (!swarm.agentList.includes(swarm.defaultAgent)) {
        throw new Error(
          `agent-swarm swarm ${swarmName} default agent not in agent list`
        );
      }
      swarm.agentList.forEach((agentName) =>
        this.agentValidationService.validate(agentName, source)
      );
      swarm.policies?.forEach((policyName) =>
        this.policyValidationService.validate(policyName, source)
      );
    }
  ) as (swarmName: SwarmName, source: string) => void;
}

/**
 * Default export of the SwarmValidationService class.
 * Provides a service for validating swarm configurations in the swarm system,
 * integrating with SwarmSchemaService, ClientSwarm, AgentValidationService,
 * PolicyValidationService, SessionValidationService, and LoggerService,
 * with memoized validation and comprehensive agent/policy checks.
 * @type {typeof SwarmValidationService}
 */
export default SwarmValidationService;
