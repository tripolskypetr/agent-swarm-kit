import { inject } from "src/lib/core/di";
import { HistoryConnectionService } from "../connection/HistoryConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import ContextService from "../base/ContextService";
import { IModelMessage } from "src/model/ModelMessage.model";
import { AgentName } from "src/interfaces/Agent.interface";

interface IHistoryConnectionService extends HistoryConnectionService {}

type InternalKeys = keyof {
  getHistory: never;
  getItems: never;
};

type THistoryConnectionService = {
  [key in Exclude<keyof IHistoryConnectionService, InternalKeys>]: unknown;
};

export class HistoryPublicService implements THistoryConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly historyConnectionService = inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  );

  public push = async (
    message: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("historyPublicService push", {
      message,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.historyConnectionService.push(message);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public toArrayForAgent = async (
    prompt: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("historyPublicService toArrayForAgent", {
      prompt,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.historyConnectionService.toArrayForAgent(prompt);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public toArrayForRaw = async (clientId: string, agentName: AgentName) => {
    this.loggerService.log("historyPublicService toArrayForRaw", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.historyConnectionService.toArrayForRaw();
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  public dispose = async (clientId: string, agentName: AgentName) => {
    this.loggerService.log("historyPublicService dispose", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.historyConnectionService.dispose();
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };
}

export default HistoryPublicService;
