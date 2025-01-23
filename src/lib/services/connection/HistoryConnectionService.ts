import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import IHistory from "src/interfaces/History.interface";
import { IModelMessage } from "src/model/ModelMessage.model";
import { IPubsubArray, memoize, PubsubArrayAdapter } from "functools-kit";
import ClientHistory from "src/client/ClientHistory";
import { TContextService } from "../base/ContextService";

export class HistoryConnectionService implements IHistory {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(TYPES.contextService);

  public getItems = memoize<(clientId: string) => IPubsubArray<IModelMessage>>(
    ([clientId]) => clientId,
    () => new PubsubArrayAdapter()
  );

  public getHistory = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) =>
      new ClientHistory({
        clientId,
        agentName,
        items: this.getItems(clientId),
        logger: this.loggerService,
      })
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
    await this.getItems(this.contextService.context.clientId).clear();
    this.getItems.clear(this.contextService.context.clientId);
    this.getHistory.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.agentName}`
    );
  };
}

export default HistoryConnectionService;
