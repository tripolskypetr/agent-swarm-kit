import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IHistory from "../../../interfaces/History.interface";
import { IModelMessage } from "../../../model/ModelMessage.model";
import { IPubsubArray, memoize } from "functools-kit";
import ClientHistory from "../../../client/ClientHistory";
import { TContextService } from "../base/ContextService";
import SessionValidationService from "../validation/SessionValidationService";
import { AgentName } from "../../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing history connections.
 * @implements {IHistory}
 */
export class HistoryConnectionService implements IHistory {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Retrieves items for a given client and agent.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @returns {IPubsubArray<IModelMessage>} The items.
   */
  public getItems = memoize<
    (clientId: string, agentName: AgentName) => IPubsubArray<IModelMessage>
  >(
    ([clientId]) => clientId,
    (clientId: string, agentName: AgentName) =>
      GLOBAL_CONFIG.CC_GET_AGENT_HISTORY(clientId, agentName)
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
        items: this.getItems(clientId, agentName),
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
      context: this.contextService.context,
    });
    return await this.getHistory(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).push(message);
  };

  /**
   * Converts the history to an array for the agent.
   * @param {string} prompt - The prompt.
   * @returns {Promise<any[]>} A promise that resolves to an array for the agent.
   */
  public toArrayForAgent = async (prompt: string) => {
    this.loggerService.log(`historyConnectionService toArrayForAgent`, {
      context: this.contextService.context,
    });
    return await this.getHistory(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).toArrayForAgent(prompt);
  };

  /**
   * Converts the history to a raw array.
   * @returns {Promise<any[]>} A promise that resolves to a raw array.
   */
  public toArrayForRaw = async () => {
    this.loggerService.log(`historyConnectionService toArrayForRaw`, {
      context: this.contextService.context,
    });
    return await this.getHistory(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).toArrayForRaw();
  };

  /**
   * Disposes of the history connection service.
   * @returns {Promise<void>} A promise that resolves when the service is disposed.
   */
  public dispose = async () => {
    this.loggerService.log(`historyConnectionService dispose`, {
      context: this.contextService.context,
    });
    if (GLOBAL_CONFIG.CC_AGENT_SEPARATE_HISTORY) {
      await this.getItems(
        this.contextService.context.clientId,
        this.contextService.context.agentName,
      ).clear();
      this.getItems.clear(this.contextService.context.clientId);
    }
    this.getHistory.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.agentName}`
    );
    this.sessionValidationService.removeHistoryUsage(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    );
  };
}

export default HistoryConnectionService;
