import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import { TContextService } from "../base/ContextService";
import ClientSwarm from "../../../client/ClientSwarm";
import SwarmSchemaService from "../schema/SwarmSchemaService";
import AgentConnectionService from "./AgentConnectionService";
import { AgentName, IAgent } from "../../../interfaces/Agent.interface";
import ISwarm from "../../../interfaces/Swarm.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing swarm connections.
 * @implements {ISwarm}
 */
export class SwarmConnectionService implements ISwarm {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
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
      const { agentList, defaultAgent, callbacks } =
        this.swarmSchemaService.get(swarmName);
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
        async onAgentChanged(clientId, agentName, swarmName) {
          if (callbacks && callbacks.onAgentChanged) {
            callbacks.onAgentChanged(clientId, agentName, swarmName);
          }
          await GLOBAL_CONFIG.CC_SWARM_AGENT_CHANGED(
            clientId,
            agentName,
            swarmName
          );
        },
      });
    }
  );

  /**
   * Waits for the output from the swarm.
   * @returns {Promise<any>} The output from the swarm.
   */
  public waitForOutput = async () => {
    this.loggerService.log(`swarmConnectionService waitForOutput`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).waitForOutput();
  };

  /**
   * Retrieves the agent name from the swarm.
   * @returns {Promise<string>} The agent name.
   */
  public getAgentName = async () => {
    this.loggerService.log(`swarmConnectionService getAgentName`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).getAgentName();
  };

  /**
   * Retrieves the agent from the swarm.
   * @returns {Promise<IAgent>} The agent instance.
   */
  public getAgent = async () => {
    this.loggerService.log(`swarmConnectionService getAgent`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).getAgent();
  };

  /**
   * Sets the agent reference in the swarm.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgent} agent - The agent instance.
   * @returns {Promise<void>}
   */
  public setAgentRef = async (agentName: AgentName, agent: IAgent) => {
    this.loggerService.log(`swarmConnectionService setAgentRef`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).setAgentRef(agentName, agent);
  };

  /**
   * Sets the agent name in the swarm.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<void>}
   */
  public setAgentName = async (agentName: AgentName) => {
    this.loggerService.log(`swarmConnectionService setAgentName`, {
      agentName,
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).setAgentName(agentName);
  };

  /**
   * Disposes of the swarm connection.
   * @returns {Promise<void>}
   */
  public dispose = async () => {
    this.loggerService.log(`swarmConnectionService dispose`, {
      context: this.contextService.context,
    });
    this.getSwarm.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.swarmName}`
    );
  };
}

export default SwarmConnectionService;
