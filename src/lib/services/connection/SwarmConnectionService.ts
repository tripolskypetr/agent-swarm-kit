import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import { TMethodContextService } from "../context/MethodContextService";
import ClientSwarm from "../../../client/ClientSwarm";
import SwarmSchemaService from "../schema/SwarmSchemaService";
import AgentConnectionService from "./AgentConnectionService";
import { AgentName, IAgent } from "../../../interfaces/Agent.interface";
import ISwarm from "../../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import BusService from "../base/BusService";
import { PersistSwarmAdapter } from "../../../classes/Persist";

/**
 * Service class for managing swarm connections and operations in the swarm system.
 * Implements ISwarm to provide an interface for swarm instance management, agent navigation, output handling, and lifecycle operations, scoped to clientId and swarmName.
 * Integrates with ClientAgent (agent execution within swarms), SwarmPublicService (public swarm API), AgentConnectionService (agent management), SessionConnectionService (session-swarm linking), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientSwarm instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SwarmSchemaService for swarm configuration and AgentConnectionService for agent instantiation, applying persistence via PersistSwarmAdapter or defaults from GLOBAL_CONFIG.
 * @implements {ISwarm}
 */
export class SwarmConnectionService implements ISwarm {
  /**
   * Logger service instance, injected via DI, for logging swarm operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SwarmPublicService and PerfService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting swarm-related events.
   * Passed to ClientSwarm for event propagation (e.g., agent changes), aligning with BusService’s event system in AgentConnectionService.
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve clientId and swarmName in method calls, integrating with MethodContextService’s scoping in SwarmPublicService.
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Agent connection service instance, injected via DI, for managing agent instances.
   * Provides agent instances to ClientSwarm in getSwarm, supporting AgentPublicService and ClientAgent integration.
   * @private
   */
  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  /**
   * Swarm schema service instance, injected via DI, for retrieving swarm configurations.
   * Provides configuration (e.g., agentList, defaultAgent) to ClientSwarm in getSwarm, aligning with SwarmMetaService’s schema management.
   * @private
   */
  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Retrieves or creates a memoized ClientSwarm instance for a given client and swarm name.
   * Uses functools-kit’s memoize to cache instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
   * Configures the swarm with schema data from SwarmSchemaService, agent instances from AgentConnectionService, and persistence via PersistSwarmAdapter or defaults from GLOBAL_CONFIG.
   * Supports ClientAgent (agent execution within swarms), SessionConnectionService (swarm access in sessions), and SwarmPublicService (public API).
   */
  public getSwarm = memoize(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    (clientId: string, swarmName: string) => {
      const {
        persist = GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT,
        agentList,
        defaultAgent,
        callbacks,
        getActiveAgent = persist
          ? PersistSwarmAdapter.getActiveAgent
          : GLOBAL_CONFIG.CC_SWARM_DEFAULT_AGENT,
        setActiveAgent = persist
          ? PersistSwarmAdapter.setActiveAgent
          : GLOBAL_CONFIG.CC_SWARM_AGENT_CHANGED,
        getNavigationStack = persist
          ? PersistSwarmAdapter.getNavigationStack
          : GLOBAL_CONFIG.CC_SWARM_DEFAULT_STACK,
        setNavigationStack = persist
          ? PersistSwarmAdapter.setNavigationStack
          : GLOBAL_CONFIG.CC_SWARM_STACK_CHANGED,
      } = this.swarmSchemaService.get(swarmName);
      const agentMap: Record<AgentName, IAgent> = {};
      for (const agentName of agentList) {
        agentMap[agentName] = this.agentConnectionService.getAgent(
          clientId,
          agentName
        );
      }
      return new ClientSwarm({
        clientId,
        agentMap,
        defaultAgent,
        swarmName,
        logger: this.loggerService,
        bus: this.busService,
        getActiveAgent,
        setActiveAgent,
        getNavigationStack,
        setNavigationStack,
        callbacks,
      });
    }
  );

  /**
   * Emits a message to the session, typically for asynchronous communication.
   * Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.
   */
  public emit = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService emit`, { message });
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).emit(message);
  };

  /**
   * Pops the navigation stack or returns the default agent if the stack is empty.
   * Delegates to ClientSwarm.navigationPop, using context from MethodContextService to identify the swarm, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s navigationPop, supporting ClientAgent’s navigation within swarms.
   */
  public navigationPop = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService navigationPop`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).navigationPop();
  };

  /**
   * Returns the current busy state of the swarm.
   * Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
   * Supports debugging and flow control in client applications.
   */
  public getCheckBusy = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService getCheckBusy`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).getCheckBusy();
  };

  /**
   * Sets the busy state of the swarm.
   * Used to indicate whether the swarm is currently processing an operation, helping manage flow control and debugging.
   * Delegates to ClientSwarm.setBusy, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s setBusy, supporting ClientAgent’s busy state management.
   */
  public setBusy = async (isBusy: boolean) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService setBusy`, { isBusy });
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).setBusy(isBusy);
  };

  /**
   * Cancels the pending output by emitting an empty string, interrupting waitForOutput.
   * Delegates to ClientSwarm.cancelOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s cancelOutput, supporting ClientAgent’s output control.
   */
  public cancelOutput = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService cancelOutput`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).cancelOutput();
  };

  /**
   * Waits for and retrieves the output from the swarm’s active agent.
   * Delegates to ClientSwarm.waitForOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s waitForOutput, supporting ClientAgent’s output retrieval, typically a string from agent execution.
   */
  public waitForOutput = async (): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService waitForOutput`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).waitForOutput();
  };

  /**
   * Retrieves the name of the currently active agent in the swarm.
   * Delegates to ClientSwarm.getAgentName, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s getAgentName, supporting ClientAgent’s agent tracking.
   */
  public getAgentName = async (): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService getAgentName`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).getAgentName();
  };

  /**
   * Retrieves the currently active agent instance from the swarm.
   * Delegates to ClientSwarm.getAgent, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s getAgent, supporting ClientAgent’s agent access.
   */
  public getAgent = async (): Promise<IAgent> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService getAgent`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).getAgent();
  };

  /**
   * Sets an agent reference in the swarm’s agent map, typically for dynamic agent addition.
   * Delegates to ClientSwarm.setAgentRef, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s setAgentRef, supporting ClientAgent’s agent management.
   */
  public setAgentRef = async (agentName: AgentName, agent: IAgent) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService setAgentRef`, {
        agentName,
      });
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).setAgentRef(agentName, agent);
  };

  /**
   * Sets the active agent in the swarm by name, updating the navigation state.
   * Delegates to ClientSwarm.setAgentName, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SwarmPublicService’s setAgentName, supporting ClientAgent’s navigation control.
   */
  public setAgentName = async (agentName: AgentName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService setAgentName`, {
        agentName,
      });
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).setAgentName(agentName);
  };

  /**
   * Disposes of the swarm connection, clearing the memoized instance.
   * Checks if the swarm exists in the memoization cache before clearing it, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with SwarmPublicService’s dispose and PerfService’s cleanup, but does not call ClientSwarm.dispose (assuming cleanup is handled internally or unnecessary).
   */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.swarmName}`;
    if (!this.getSwarm.has(key)) {
      return;
    }
    await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).dispose();
    this.getSwarm.clear(key);
  };
}

/**
 * Default export of the SwarmConnectionService class.
 * Provides the primary service for managing swarm connections in the swarm system, integrating with ClientAgent, SwarmPublicService, AgentConnectionService, SessionConnectionService, and PerfService, with memoized swarm management.
 */
export default SwarmConnectionService;
