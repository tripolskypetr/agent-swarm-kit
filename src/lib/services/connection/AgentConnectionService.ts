import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { TContextService } from "../base/ContextService";
import { memoize } from "functools-kit";
import ClientAgent from "src/client/ClientAgent";
import HistoryConnectionService from "./HistoryConnectionService";
import AgentSchemaService from "../schema/AgentSchemaService";
import ToolSchemaService from "../schema/ToolSchemaService";
import { IAgent } from "src/interfaces/Agent.interface";
import CompletionSchemaService from "../schema/CompletionSchemaService";
import validateDefault from "src/validation/validateDefault";

export class AgentConnectionService implements IAgent {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly historyConnectionService = inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  );
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );
  private readonly toolSchemaService = inject<ToolSchemaService>(
    TYPES.toolSchemaService
  );
  private readonly completionSchemaService = inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  );

  public getAgent = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) => {
      const { prompt, tools, completion: completionName, validate = validateDefault } = this.agentSchemaService.get(agentName);
      const completion = this.completionSchemaService.get(completionName)
      return new ClientAgent({
        clientId,
        agentName,
        validate,
        logger: this.loggerService,
        history: this.historyConnectionService,
        prompt,
        tools: tools?.map(this.toolSchemaService.get),
        completion,
      });
    }
  );

  public execute = async (input: string) => {
    this.loggerService.log(`agentConnectionService execute`, {
      input,
      context: this.contextService.context,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).execute(input);
  };

  public waitForOutput = async () => {
    this.loggerService.log(`agentConnectionService waitForOutput`, {
      context: this.contextService.context,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).waitForOutput();
  };

  public commitToolOutput = async (content: string) => {
    this.loggerService.log(`agentConnectionService commitToolOutput`, {
      content,
      context: this.contextService.context,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitToolOutput(content);
  };

  public commitSystemMessage = async (message: string) => {
    this.loggerService.log(`agentConnectionService commitSystemMessage`, {
      message,
      context: this.contextService.context,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitToolOutput(message);
  };

  public dispose = async () => {
    this.loggerService.log(`agentConnectionService dispose`, {
      context: this.contextService.context,
    });
    this.getAgent.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.agentName}`
    );
  };
}

export default AgentConnectionService;
