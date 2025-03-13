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
import { PersistSwarm } from "src/classes/Persist";

/**
 * Service for managing swarm connections.
 * @implements {ISwarm}
 */
export class SwarmConnectionService implements ISwarm {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Retrieves a swarm instance based on client ID and swarm name.
   * @param {string} clientId - The client ID.
   * @param {string} swarmName - The swarm name.
   * @returns {ClientSwarm} The client swarm instance.
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
          ? PersistSwarm.getActiveAgent
          : GLOBAL_CONFIG.CC_SWARM_DEFAULT_AGENT,
        setActiveAgent = persist
          ? PersistSwarm.setActiveAgent
          : GLOBAL_CONFIG.CC_SWARM_AGENT_CHANGED,
        getNavigationStack = persist
          ? PersistSwarm.getNavigationStack
          : GLOBAL_CONFIG.CC_SWARM_DEFAULT_STACK,
        setNavigationStack = persist
          ? PersistSwarm.setNavigationStack
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
   * Pop the navigation stack or return default agent
   * @returns {Promise<string>} - The pending agent for navigation
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
   * Cancel the await of output by emit of empty string
   * @returns {Promise<void>}
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
   * Waits for the output from the swarm.
   * @returns {Promise<any>} The output from the swarm.
   */
  public waitForOutput = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService waitForOutput`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).waitForOutput();
  };

  /**
   * Retrieves the agent name from the swarm.
   * @returns {Promise<string>} The agent name.
   */
  public getAgentName = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService getAgentName`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).getAgentName();
  };

  /**
   * Retrieves the agent from the swarm.
   * @returns {Promise<IAgent>} The agent instance.
   */
  public getAgent = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService getAgent`);
    return await this.getSwarm(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).getAgent();
  };

  /**
   * Sets the agent reference in the swarm.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgent} agent - The agent instance.
   * @returns {Promise<void>}
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
   * Sets the agent name in the swarm.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<void>}
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
   * Disposes of the swarm connection.
   * @returns {Promise<void>}
   */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`swarmConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.swarmName}`;
    if (!this.getSwarm.has(key)) {
      return;
    }
    this.getSwarm.clear(key);
  };
}

export default SwarmConnectionService;
