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
 *  */
interface ISwarmConnectionService extends SwarmConnectionService { }

/**
 * Type representing keys to exclude from ISwarmConnectionService (internal methods).
 * Used to filter out non-public methods like getSwarm in TSwarmConnectionService.
 *  */
type InternalKeys = keyof {
  getSwarm: never;
};

/**
 * Type representing the public interface of SwarmPublicService, derived from ISwarmConnectionService.
 * Excludes internal methods (e.g., getSwarm) via InternalKeys, ensuring a consistent public API for swarm-level operations.
 *  */
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
   *    * */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Swarm connection service instance, injected via DI, for underlying swarm operations.
   * Provides core functionality (e.g., navigationPop, getAgent) called by public methods, supporting ClientAgent’s swarm-level needs.
   *    * */
  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  /**
   * Emits a message to the session for a specific client and swarm.
   * Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).
   *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Pops the navigation stack or returns the default agent for the swarm, scoped to a client.
   * Wraps SwarmConnectionService.navigationPop with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., navigating agent flow in EXECUTE_FN) and SwarmMetaService (e.g., managing swarm navigation state).
   *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Returns the current busy state of the swarm.
   * Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
   * Supports debugging and flow control in client applications.
   *    *    *    *    */
  public getCheckBusy = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService getCheckBusy", {
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getCheckBusy();
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
        computeName: "",
      }
    );
  };

  /**
   * Sets the busy state of the swarm, indicating whether it is currently processing an operation.
   * Wraps SwarmConnectionService.setBusy with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., marking swarm busy during EXECUTE_FN) and SessionPublicService (e.g., managing swarm state in connect).
   *    *    *    *    *    */
  public setBusy = async (
    isBusy: boolean,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmPublicService setBusy", {
        isBusy,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.setBusy(isBusy);
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
        computeName: "",
      }
    );
  }

  /**
   * Cancels the await of output in the swarm by emitting an empty string, scoped to a client.
   * Wraps SwarmConnectionService.cancelOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., interrupting EXECUTE_FN output) and SessionPublicService (e.g., output control in connect).
   *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Waits for output from the swarm, scoped to a client.
   * Wraps SwarmConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., awaiting EXECUTE_FN results) and SessionPublicService (e.g., output handling in connect).
   *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Retrieves the current agent name from the swarm, scoped to a client.
   * Wraps SwarmConnectionService.getAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., identifying active agent in EXECUTE_FN) and AgentPublicService (e.g., agent context).
   *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Retrieves the current agent instance from the swarm, scoped to a client.
   * Wraps SwarmConnectionService.getAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., accessing agent details in EXECUTE_FN) and AgentPublicService (e.g., agent operations).
   *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Sets an agent reference in the swarm, associating an agent instance with an agent name, scoped to a client.
   * Wraps SwarmConnectionService.setAgentRef with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., configuring agents in EXECUTE_FN) and AgentPublicService (e.g., agent management).
   *    *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Sets the current agent name in the swarm, scoped to a client.
   * Wraps SwarmConnectionService.setAgentName with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., switching agents in EXECUTE_FN) and AgentPublicService (e.g., agent context updates).
   *    *    *    *    *    */
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
        computeName: "",
      }
    );
  };

  /**
   * Disposes of the swarm, cleaning up resources, scoped to a client.
   * Wraps SwarmConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN), SessionPublicService’s dispose, and PerfService’s resource management.
   *    *    *    *    */
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
        computeName: "",
      }
    );
  };
}

/**
 * Default export of the SwarmPublicService class.
 * Provides the primary public interface for swarm-level operations in the swarm system, integrating with ClientAgent, AgentPublicService, SwarmMetaService, SessionPublicService, and PerfService.
 *  */
export default SwarmPublicService;
