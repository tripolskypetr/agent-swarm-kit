import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { TContextService } from "../base/ContextService";
import { memoize } from "functools-kit";
import ClientAgent from "../../../client/ClientAgent";
import HistoryConnectionService from "./HistoryConnectionService";
import AgentSchemaService from "../schema/AgentSchemaService";
import ToolSchemaService from "../schema/ToolSchemaService";
import { IAgent } from "../../../interfaces/Agent.interface";
import CompletionSchemaService from "../schema/CompletionSchemaService";
import validateDefault from "../../../validation/validateDefault";
import SessionValidationService from "../validation/SessionValidationService";
import { ExecutionMode } from "../../../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import StorageConnectionService from "./StorageConnectionService";
import BusService from "../base/BusService";

/**
 * Service for managing agent connections.
 * @implements {IAgent}
 */
export class AgentConnectionService implements IAgent {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );
  private readonly historyConnectionService = inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  );
  private readonly storageConnectionService = inject<StorageConnectionService>(
    TYPES.storageConnectionService
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

  /**
   * Retrieves an agent instance.
   * @param {string} clientId - The client ID.
   * @param {string} agentName - The agent name.
   * @returns {ClientAgent} The client agent instance.
   */
  public getAgent = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) => {
      const {
        prompt,
        system,
        tools,
        transform = GLOBAL_CONFIG.CC_AGENT_OUTPUT_TRANSFORM,
        map = GLOBAL_CONFIG.CC_AGENT_OUTPUT_MAP,
        callbacks,
        storages,
        states,
        completion: completionName,
        validate = validateDefault,
      } = this.agentSchemaService.get(agentName);
      const completion = this.completionSchemaService.get(completionName);
      this.sessionValidationService.addAgentUsage(clientId, agentName);
      storages?.forEach((storageName) =>
        this.storageConnectionService
          .getStorage(clientId, storageName)
          .waitForInit()
      );
      states?.forEach((storageName) =>
        this.storageConnectionService
          .getStorage(clientId, storageName)
          .waitForInit()
      );
      return new ClientAgent({
        clientId,
        agentName,
        validate,
        logger: this.loggerService,
        bus: this.busService,
        history: this.historyConnectionService.getHistory(clientId, agentName),
        prompt,
        system,
        transform,
        map,
        tools: tools?.map(this.toolSchemaService.get),
        completion,
        ...callbacks,
      });
    }
  );

  /**
   * Executes an input command.
   * @param {string} input - The input command.
   * @returns {Promise<any>} The execution result.
   */
  public execute = async (input: string, mode: ExecutionMode) => {
    this.loggerService.log(`agentConnectionService execute`, {
      input,
      mode,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).execute(input, mode);
  };

  /**
   * Waits for the output from the agent.
   * @returns {Promise<any>} The output result.
   */
  public waitForOutput = async () => {
    this.loggerService.log(`agentConnectionService waitForOutput`);
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).waitForOutput();
  };

  /**
   * Commits tool output.
   * @param {string} content - The tool output content.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @returns {Promise<any>} The commit result.
   */
  public commitToolOutput = async (toolId: string, content: string) => {
    this.loggerService.log(`agentConnectionService commitToolOutput`, {
      content,
      toolId,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitToolOutput(toolId, content);
  };

  /**
   * Commits a system message.
   * @param {string} message - The system message.
   * @returns {Promise<any>} The commit result.
   */
  public commitSystemMessage = async (message: string) => {
    this.loggerService.log(`agentConnectionService commitSystemMessage`, {
      message,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitSystemMessage(message);
  };

  /**
   * Commits a user message without answer.
   * @param {string} message - The message.
   * @returns {Promise<any>} The commit result.
   */
  public commitUserMessage = async (message: string) => {
    this.loggerService.log(`agentConnectionService commitUserMessage`, {
      message,
    });
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitUserMessage(message);
  };

  /**
   * Commits agent change to prevent the next tool execution from being called.
   * @returns {Promise<any>} The commit result.
   */
  public commitAgentChange = async () => {
    this.loggerService.log(`agentConnectionService commitAgentChange`);
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitAgentChange();
  };

  /**
   * Commits flush of agent history
   * @returns {Promise<any>} The commit result.
   */
  public commitFlush = async () => {
    this.loggerService.log(`agentConnectionService commitFlush`);
    return await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).commitFlush();
  };

  /**
   * Disposes of the agent connection.
   * @returns {Promise<void>} The dispose result.
   */
  public dispose = async () => {
    this.loggerService.log(`agentConnectionService dispose`);
    const key = `${this.contextService.context.clientId}-${this.contextService.context.agentName}`;
    if (!this.getAgent.has(key)) {
      return;
    }
    await this.getAgent(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    ).dispose();
    this.getAgent.clear(key);
    this.sessionValidationService.removeAgentUsage(
      this.contextService.context.clientId,
      this.contextService.context.agentName
    );
  };
}

export default AgentConnectionService;
