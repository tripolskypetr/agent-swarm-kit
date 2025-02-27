import { inject } from "../../core/di";
import { HistoryConnectionService } from "../connection/HistoryConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IModelMessage } from "../../../model/ModelMessage.model";
import { AgentName } from "../../../interfaces/Agent.interface";

interface IHistoryConnectionService extends HistoryConnectionService {}

type InternalKeys = keyof {
  getHistory: never;
  getItems: never;
};

type THistoryConnectionService = {
  [key in Exclude<keyof IHistoryConnectionService, InternalKeys>]: unknown;
};

/**
 * Service for handling public history operations.
 */
export class HistoryPublicService implements THistoryConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly historyConnectionService = inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  );

  /**
   * Pushes a message to the history.
   * @param {IModelMessage} message - The message to push.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  public push = async (
    message: IModelMessage,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.info("historyPublicService push", {
      methodName,
      message,
      clientId,
      agentName,
    });
    return await MethodContextService.runInContext(
      async () => {
        return await this.historyConnectionService.push(message);
      },
      {
        methodName,
        clientId,
        agentName,
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Converts history to an array for a specific agent.
   * @param {string} prompt - The prompt.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @returns {Promise<any[]>} A promise that resolves to an array of history items.
   */
  public toArrayForAgent = async (
    prompt: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.info("historyPublicService toArrayForAgent", {
      prompt,
      clientId,
      agentName,
    });
    return await MethodContextService.runInContext(
      async () => {
        return await this.historyConnectionService.toArrayForAgent(prompt);
      },
      {
        methodName,
        clientId,
        agentName,
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Converts history to a raw array.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @returns {Promise<any[]>} A promise that resolves to a raw array of history items.
   */
  public toArrayForRaw = async (methodName: string, clientId: string, agentName: AgentName) => {
    this.loggerService.info("historyPublicService toArrayForRaw", {
      methodName,
      clientId,
      agentName,
    });
    return await MethodContextService.runInContext(
      async () => {
        return await this.historyConnectionService.toArrayForRaw();
      },
      {
        methodName,
        clientId,
        agentName,
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Disposes of the history.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  public dispose = async (methodName: string, clientId: string, agentName: AgentName) => {
    this.loggerService.info("historyPublicService dispose", {
      clientId,
      agentName,
    });
    return await MethodContextService.runInContext(
      async () => {
        return await this.historyConnectionService.dispose();
      },
      {
        methodName,
        clientId,
        agentName,
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };
}

export default HistoryPublicService;
