import { inject } from "../../core/di";
import { SwarmConnectionService } from "../connection/SwarmConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
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
  public cancelOutput = async (methodName: string, clientId: string, swarmName: SwarmName) => {
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
  public waitForOutput = async (methodName: string, clientId: string, swarmName: SwarmName) => {
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
  public getAgentName = async (methodName: string, clientId: string, swarmName: SwarmName) => {
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
  public getAgent = async (methodName: string, clientId: string, swarmName: SwarmName) => {
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
    methodName: string,
    clientId: string,
    swarmName: SwarmName,
    agentName: AgentName,
    agent: IAgent
  ) => {
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
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
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
  public dispose = async (methodName: string, clientId: string, swarmName: SwarmName) => {
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
        agentName: "",
        storageName: "",
        stateName: "",
      }
    );
  };
}

export default SwarmPublicService;
