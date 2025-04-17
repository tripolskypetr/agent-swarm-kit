import { scoped } from "di-scoped";
import { AgentName } from "../../../interfaces/Agent.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { StorageName } from "../../../interfaces/Storage.interface";
import { StateName } from "../../../interfaces/State.interface";
import { PolicyName } from "../../../interfaces/Policy.interface";
import { MCPName } from "../../../interfaces/MCP.interface";

/**
 * Interface defining the structure of method call context in the swarm system.
 * Represents metadata for tracking a specific method invocation, used across services like ClientAgent, PerfService, and LoggerService.
 * @interface IMethodContext
 */
export interface IMethodContext {
  /**
   * The unique identifier of the client session, tying to ClientAgent’s clientId and PerfService’s execution tracking.
   * @type {string}
   */
  clientId: string;

  /**
   * The name of the method being invoked, used in LoggerService (e.g., log method context) and PerfService (e.g., METHOD_NAME_COMPUTE_STATE).
   * @type {string}
   */
  methodName: string;

  /**
   * The name of the agent involved in the method call, sourced from Agent.interface, used in ClientAgent (e.g., agent-specific execution) and DocService (e.g., agent docs).
   * @type {AgentName}
   */
  agentName: AgentName;

  /**
   * The name of the swarm involved in the method call, sourced from Swarm.interface, used in PerfService (e.g., computeClientState) and DocService (e.g., swarm docs).
   * @type {SwarmName}
   */
  swarmName: SwarmName;

  /**
   * The name of the storage resource involved, sourced from Storage.interface, used in ClientAgent (e.g., storage access) and DocService (e.g., storage docs).
   * @type {StorageName}
   */
  storageName: StorageName;

  /**
   * The name of the state resource involved, sourced from State.interface, used in PerfService (e.g., sessionState) and DocService (e.g., state docs).
   * @type {StateName}
   */
  stateName: StateName;

  /**
   * The name of the policy involved, sourced from Policy.interface, used in PerfService (e.g., policyBans) and DocService (e.g., policy docs).
   * @type {PolicyName}
   */
  policyName: PolicyName;

  /**
   * The name of the mcp involved, sourced from MCP.interface
   * @type {PolicyName}
   */
  mcpName: MCPName;
}

/**
 * Scoped service class providing method call context information in the swarm system.
 * Stores and exposes an IMethodContext object (clientId, methodName, agentName, etc.) via dependency injection, scoped using di-scoped for method-specific instances.
 * Integrates with ClientAgent (e.g., EXECUTE_FN method context), PerfService (e.g., computeClientState with METHOD_NAME_COMPUTE_STATE), LoggerService (e.g., context logging in info), and DocService (e.g., documenting method-related entities).
 * Provides a lightweight, immutable context container for tracking method invocation metadata across the system.
 */
export const MethodContextService = scoped(
  class {
    /**
     * Creates an instance of MethodContextService with the provided method context.
     * Stores the context immutably, making it available to dependent services like LoggerService and PerfService via DI.
     * @param {IMethodContext} context - The method context object containing clientId, methodName, agentName, swarmName, storageName, stateName, and policyName.
     */
    constructor(readonly context: IMethodContext) {}
  }
);

/**
 * Type alias representing an instance of MethodContextService.
 * Used in dependency injection (e.g., LoggerService, PerfService) to type the injected service, ensuring type safety across the swarm system.
 * @typedef {InstanceType<typeof MethodContextService>} TMethodContextService
 */
export type TMethodContextService = InstanceType<typeof MethodContextService>;

/**
 * Default export of the MethodContextService scoped service.
 * Provides the primary interface for accessing method call context in the swarm system, integrating with ClientAgent, PerfService, LoggerService, and DocService.
 * @type {typeof MethodContextService}
 */
export default MethodContextService;
