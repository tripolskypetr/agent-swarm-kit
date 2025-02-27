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
   * Cancel the await of output by emit of empty string
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public cancelOutput = async (requestId: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService cancelOutput", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.cancelOutput();
      },
      {
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Waits for output from the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public waitForOutput = async (requestId: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService waitForOutput", {
      clientId,
      requestId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.waitForOutput();
      },
      {
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Gets the agent name from the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<string>}
   */
  public getAgentName = async (requestId: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService getAgentName", {
      clientId,
      swarmName,
      requestId,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getAgentName();
      },
      {
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Gets the agent from the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<IAgent>}
   */
  public getAgent = async (requestId: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService getAgent", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.getAgent();
      },
      {
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
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
  public setAgentRef = async (
    requestId: string,
    clientId: string,
    swarmName: SwarmName,
    agentName: AgentName,
    agent: IAgent
  ) => {
    this.loggerService.log("swarmPublicService setAgentRef", {
      requestId,
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
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
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
  public setAgentName = async (
    agentName: AgentName,
    requestId: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("swarmPublicService setAgentName", {
      requestId,
      agentName,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.setAgentName(agentName);
      },
      {
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Disposes of the swarm.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public dispose = async (requestId: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("swarmPublicService dispose", {
      requestId,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.swarmConnectionService.dispose();
      },
      {
        requestId,
        clientId,
        swarmName,
        agentName: "",
        storageName: "",
        stateName: "",
      }
    );
  };
}

export default SwarmPublicService;
