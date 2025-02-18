import { inject } from "../../core/di";
import { SwarmConnectionService } from "../connection/SwarmConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { AgentName, IAgent } from "../../../interfaces/Agent.interface";

interface ISwarmConnectionService extends SwarmConnectionService {}

type InternalKeys = keyof {
  getSwarm: never;
};

type TSwarmConnectionService = {
  [key in Exclude<keyof ISwarmConnectionService, InternalKeys>]: unknown;
};

/**
 * Service for managing public swarm interactions.
 */
export class SwarmPublicService implements TSwarmConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  /**
   * Waits for output from the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public waitForOutput = async (clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService waitForOutput", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.waitForOutput();
      },
      {
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
      }
    );
  };

  /**
   * Gets the agent name from the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<string>}
   */
  public getAgentName = async (clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService getAgentName", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getAgentName();
      },
      {
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
      }
    );
  };

  /**
   * Gets the agent from the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<IAgent>}
   */
  public getAgent = async (clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService getAgent", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getAgent();
      },
      {
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
      }
    );
  };

  /**
   * Sets the agent reference in the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @param {AgentName} agentName - The agent name.
   * @param {IAgent} agent - The agent instance.
   * @returns {Promise<void>}
   */
  public setAgentRef = async (clientId: string, swarmName: SwarmName, agentName: AgentName, agent: IAgent) => {
    this.loggerService.log("swarmPublicService setAgentRef", {
      agentName,
      agent,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.setAgentRef(agentName, agent);
      },
      {
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
      }
    );
  };

  /**
   * Sets the agent name in the swarm.
   * @param {AgentName} agentName - The agent name.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public setAgentName = async (agentName: AgentName, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService setAgentName", {
      agentName,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.setAgentName(agentName);
      },
      {
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
      }
    );
  };

  /**
   * Disposes of the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public dispose = async (clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService dispose", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.dispose();
      },
      {
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
      }
    );
  };
}

export default SwarmPublicService;
