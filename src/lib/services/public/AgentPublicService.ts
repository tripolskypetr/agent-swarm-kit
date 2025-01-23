import { inject } from "src/lib/core/di";
import { AgentConnectionService } from "../connection/AgentConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import ContextService from "../base/ContextService";
import { AgentName } from "src/interfaces/Agent.interface";

interface IAgentConnectionService extends AgentConnectionService {}

type InternalKeys = keyof {
  getAgent: never;
};

type TAgentConnectionService = {
  [key in Exclude<keyof IAgentConnectionService, InternalKeys>]: unknown;
};

export class AgentPublicService implements TAgentConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  public execute = async (
    input: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService execute", {
      input,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.execute(input);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public waitForOutput = async (clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService waitForOutput", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.waitForOutput();
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public commitToolOutput = async (
    content: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitToolOutput", {
      content,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitToolOutput(content);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public commitSystemMessage = async (
    message: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitSystemMessage", {
      message,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitSystemMessage(message);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public dispose = async (
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService dispose", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.dispose();
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };
}

export default AgentPublicService;
