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

export class HistoryConnectionService implements IHistory {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  public getItems = memoize<
    (clientId: string, agentName: AgentName) => IPubsubArray<IModelMessage>
  >(
    ([clientId]) => clientId,
    (clientId: string, agentName: AgentName) =>
      GLOBAL_CONFIG.CC_GET_AGENT_HISTORY(clientId, agentName)
  );

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

  public push = async (message: IModelMessage) => {
    this.loggerService.log(`historyConnectionService push`, {
      context: this.contextService.context,
    });
    return await this.getHistory(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).push(message);
  };

  public toArrayForAgent = async (prompt: string) => {
    this.loggerService.log(`historyConnectionService toArrayForAgent`, {
      context: this.contextService.context,
    });
    return await this.getHistory(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).toArrayForAgent(prompt);
  };

  public toArrayForRaw = async () => {
    this.loggerService.log(`historyConnectionService toArrayForRaw`, {
      context: this.contextService.context,
    });
    return await this.getHistory(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).toArrayForRaw();
  };

  public dispose = async () => {
    this.loggerService.log(`historyConnectionService dispose`, {
      context: this.contextService.context,
    });
    await this.getItems(
      this.contextService.context.clientId,
      this.contextService.context.agentName,
    ).clear();
    this.getItems.clear(this.contextService.context.clientId);
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
