import { inject } from "src/lib/core/di";
import { SwarmConnectionService } from "../connection/SwarmConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import ContextService from "../base/ContextService";
import { SwarmName } from "src/interfaces/Swarm.interface";
import { AgentName } from "src/interfaces/Agent.interface";

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
