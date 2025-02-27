import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IHistory from "../../../interfaces/History.interface";
import { IModelMessage } from "../../../model/ModelMessage.model";
import { IPubsubArray, memoize } from "functools-kit";
import ClientHistory from "../../../client/ClientHistory";
import { TMethodContextService } from "../context/MethodContextService";
import SessionValidationService from "../validation/SessionValidationService";
import { AgentName } from "../../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { IHistoryAdapter } from "../../../classes/History";
import BusService from "../base/BusService";

/**
 * Service for managing history connections.
 * @implements {IHistory}
 */
export class HistoryConnectionService implements IHistory {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Retrieves the history for a given client and agent.
   * @param {string} clientId - The client ID.
   * @param {string} agentName - The agent name.
   * @returns {ClientHistory} The client history.
   */
  public getHistory = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) => {
      this.sessionValidationService.addHistoryUsage(clientId, agentName);
      return new ClientHistory({
        clientId,
        agentName,
        bus: this.busService,
        items: GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER(clientId, agentName),
        logger: this.loggerService,
      });
    }
  );

  /**
   * Pushes a message to the history.
   * @param {IModelMessage} message - The message to push.
   * @returns {Promise<void>} A promise that resolves when the message is pushed.
   */
  public push = async (message: IModelMessage) => {
    this.loggerService.log(`historyConnectionService push`, {
      message,
    });
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).push(message);
  };

  /**
   * Converts the history to an array for the agent.
   * @param {string} prompt - The prompt.
   * @returns {Promise<any[]>} A promise that resolves to an array for the agent.
   */
  public toArrayForAgent = async (prompt: string) => {
    this.loggerService.log(`historyConnectionService toArrayForAgent`, {
      prompt,
    });
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).toArrayForAgent(prompt);
  };

  /**
   * Converts the history to a raw array.
   * @returns {Promise<any[]>} A promise that resolves to a raw array.
   */
  public toArrayForRaw = async () => {
    this.loggerService.log(`historyConnectionService toArrayForRaw`);
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).toArrayForRaw();
  };

  /**
   * Disposes of the history connection service.
   * @returns {Promise<void>} A promise that resolves when the service is disposed.
   */
  public dispose = async () => {
    this.loggerService.log(`historyConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.agentName}`;
    if (!this.getHistory.has(key)) {
      return;
    }
    await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).dispose();
    this.getHistory.clear(key);
    this.sessionValidationService.removeHistoryUsage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    );
  };
}

export default HistoryConnectionService;
