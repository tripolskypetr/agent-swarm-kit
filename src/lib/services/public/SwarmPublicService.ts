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

export class SwarmPublicService implements TSwarmConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

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
      }
    );
  };

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
      }
    );
  };

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
      }
    );
  };

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
      }
    );
  };

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
      }
    );
  };

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
      }
    );
  };
}

export default SwarmPublicService;
