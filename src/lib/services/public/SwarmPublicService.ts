import { inject } from "../../core/di";
import { SwarmConnectionService } from "../connection/SwarmConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { AgentName, IAgent } from "../../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Interface extending SwarmConnectionService for type definition purposes.
 * Used to define TSwarmConnectionService by excluding internal keys, ensuring SwarmPublicService aligns with public-facing operations.
 * @interface ISwarmConnectionService
 */
interface ISwarmConnectionService extends SwarmConnectionService { }

/**
 * Type representing keys to exclude from ISwarmConnectionService (internal methods).
 * Used to filter out non-public methods like getSwarm in TSwarmConnectionService.
 * @typedef {keyof { getSwarm: never }} InternalKeys
 */
type InternalKeys = keyof {
  getSwarm: never;
};

/**
 * Type representing the public interface of SwarmPublicService, derived from ISwarmConnectionService.
 * Excludes internal methods (e.g., getSwarm) via InternalKeys, ensuring a consistent public API for swarm-level operations.
 * @typedef {Object} TSwarmConnectionService
 */
type TSwarmConnectionService = {
  [key in Exclude<keyof ISwarmConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public swarm-level interactions in the swarm system.
 * Implements TSwarmConnectionService to provide a public API for swarm operations, delegating to SwarmConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., agent execution in EXECUTE_FN), AgentPublicService (e.g., agent-specific operations), SwarmMetaService (e.g., swarm metadata via swarmName), SessionPublicService (e.g., swarm context), and PerfService (e.g., tracking swarm interactions in sessionState).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like navigation, output control, agent management, and swarm disposal, all scoped to a client (clientId) and swarm (swarmName).
 */
export class SwarmPublicService implements TSwarmConnectionService {
  /**
   * Logger service instance, injected via DI, for logging swarm operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Swarm connection service instance, injected via DI, for underlying swarm operations.
   * Provides core functionality (e.g., navigationPop, getAgent) called by public methods, supporting ClientAgent’s swarm-level needs.
   * @type {SwarmConnectionService}
   * @private
   */
  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  /**
   * Emits a message to the session for a specific client and swarm.
   * Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).
   * @param {string} content - The message content to emit to the session.
   * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
   * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
   * @param {SwarmName} swarmName - The swarm name, sourced from Swarm.interface, used in SwarmMetaService context.
   * @returns {Promise<void>} A promise resolving when the message is emitted.
   */
  public emit = async (
    content: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService emit", {
        content,
        clientId,
        methodName,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.emit(content);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Pops the navigation stack or returns the default agent for the swarm, scoped to a client.
   * Wraps SwarmConnectionService.navigationPop with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., navigating agent flow in EXECUTE_FN) and SwarmMetaService (e.g., managing swarm navigation state).
   * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
   * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, sourced from Swarm.interface, used in SwarmMetaService context.
   * @returns {Promise<string>} A promise resolving to the pending agent name for navigation.
   */
  public navigationPop = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService navigationPop", {
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.navigationPop();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Cancels the await of output in the swarm by emitting an empty string, scoped to a client.
   * Wraps SwarmConnectionService.cancelOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., interrupting EXECUTE_FN output) and SessionPublicService (e.g., output control in connect).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @returns {Promise<void>} A promise resolving when the output is canceled.
   */
  public cancelOutput = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService cancelOutput", {
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.cancelOutput();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Waits for output from the swarm, scoped to a client.
   * Wraps SwarmConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., awaiting EXECUTE_FN results) and SessionPublicService (e.g., output handling in connect).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @returns {Promise<void>} A promise resolving when output is received from the swarm.
   */
  public waitForOutput = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService waitForOutput", {
        clientId,
        methodName,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.waitForOutput();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Retrieves the current agent name from the swarm, scoped to a client.
   * Wraps SwarmConnectionService.getAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., identifying active agent in EXECUTE_FN) and AgentPublicService (e.g., agent context).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @returns {Promise<string>} A promise resolving to the current agent name.
   */
  public getAgentName = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService getAgentName", {
        clientId,
        swarmName,
        methodName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getAgentName();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Retrieves the current agent instance from the swarm, scoped to a client.
   * Wraps SwarmConnectionService.getAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., accessing agent details in EXECUTE_FN) and AgentPublicService (e.g., agent operations).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @returns {Promise<IAgent>} A promise resolving to the current agent instance, sourced from Agent.interface.
   */
  public getAgent = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService getAgent", {
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getAgent();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Sets an agent reference in the swarm, associating an agent instance with an agent name, scoped to a client.
   * Wraps SwarmConnectionService.setAgentRef with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., configuring agents in EXECUTE_FN) and AgentPublicService (e.g., agent management).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @param {AgentName} agentName - The name of the agent to set, sourced from Agent.interface.
   * @param {IAgent} agent - The agent instance to associate, sourced from Agent.interface.
   * @returns {Promise<void>} A promise resolving when the agent reference is set.
   */
  public setAgentRef = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName,
    agentName: AgentName,
    agent: IAgent
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService setAgentRef", {
        methodName,
        agentName,
        agent,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.setAgentRef(agentName, agent);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Sets the current agent name in the swarm, scoped to a client.
   * Wraps SwarmConnectionService.setAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., switching agents in EXECUTE_FN) and AgentPublicService (e.g., agent context updates).
   * @param {AgentName} agentName - The name of the agent to set, sourced from Agent.interface.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @returns {Promise<void>} A promise resolving when the agent name is set.
   */
  public setAgentName = async (
    agentName: AgentName,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService setAgentName", {
        methodName,
        agentName,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.setAgentName(agentName);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * Disposes of the swarm, cleaning up resources, scoped to a client.
   * Wraps SwarmConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN), SessionPublicService’s dispose, and PerfService’s resource management.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID, scoping the operation to a specific client.
   * @param {SwarmName} swarmName - The name of the swarm, used in SwarmMetaService context.
   * @returns {Promise<void>} A promise resolving when the swarm is disposed.
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService dispose", {
        methodName,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.dispose();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };
}

/**
 * Default export of the SwarmPublicService class.
 * Provides the primary public interface for swarm-level operations in the swarm system, integrating with ClientAgent, AgentPublicService, SwarmMetaService, SessionPublicService, and PerfService.
 * @type {typeof SwarmPublicService}
 */
export default SwarmPublicService;
