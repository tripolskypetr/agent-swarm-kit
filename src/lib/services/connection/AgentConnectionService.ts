import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { TMethodContextService } from "../context/MethodContextService";
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
import StateConnectionService from "./StateConnectionService";
import ClientOperator from "../../../client/ClientOperator";
import MCPConnectionService from "./MCPConnectionService";
import { MergeMCP, NoopMCP } from "../../../classes/MCP";
import { IToolRequest } from "../../../model/Tool.model";

/**
 * Service class for managing agent connections and operations in the swarm system.
 * Implements IAgent to provide an interface for agent instantiation, execution, message handling, and lifecycle management.
 * Integrates with ClientAgent (core agent logic), AgentPublicService (public agent API), SessionPublicService (session context), HistoryPublicService (history management), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientAgent instances by clientId and agentName, ensuring efficient reuse.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with schema services (AgentSchemaService, ToolSchemaService, CompletionSchemaService) for agent configuration, validation services (SessionValidationService) for usage tracking, and connection services (HistoryConnectionService, StorageConnectionService, StateConnectionService) for agent dependencies.
 * @implements {IAgent}
 */
export class AgentConnectionService implements IAgent {
  /**
   * Logger service instance, injected via DI, for logging agent operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and PerfService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting agent-related events.
   * Passed to ClientAgent for execution events (e.g., commitExecutionBegin), aligning with BusService’s event system in SessionPublicService.
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve clientId and agentName in method calls, integrating with MethodContextService’s scoping in AgentPublicService.
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Session validation service instance, injected via DI, for tracking agent usage.
   * Used in getAgent and dispose to manage agent lifecycle, supporting SessionPublicService’s validation needs.
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * History connection service instance, injected via DI, for managing agent history.
   * Provides history instances to ClientAgent, aligning with HistoryPublicService’s functionality.
   * @private
   */
  private readonly historyConnectionService = inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  );

  /**
   * Storage connection service instance, injected via DI, for managing agent storage.
   * Initializes storage references in getAgent, supporting StoragePublicService’s client-specific storage operations.
   * @private
   */
  private readonly storageConnectionService = inject<StorageConnectionService>(
    TYPES.storageConnectionService
  );

  /**
   * State connection service instance, injected via DI, for managing agent state.
   * Initializes state references in getAgent, supporting StatePublicService’s client-specific state operations.
   * @private
   */
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  /**
   * Agent schema service instance, injected via DI, for retrieving agent configurations.
   * Provides agent details (e.g., prompt, tools) in getAgent, aligning with AgentMetaService’s schema management.
   * @private
   */
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );

  /**
   * Tool schema service instance, injected via DI, for retrieving tool configurations.
   * Maps tools for ClientAgent in getAgent, supporting DocService’s tool documentation.
   * @private
   */
  private readonly toolSchemaService = inject<ToolSchemaService>(
    TYPES.toolSchemaService
  );

  /**
   * Completion schema service instance, injected via DI, for retrieving completion configurations.
   * Provides completion logic to ClientAgent in getAgent, supporting agent execution flows.
   * @private
   */
  private readonly completionSchemaService = inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  );

  /**
   * MCP connection service instance, injected via DI, for retrieving external tools
   * Provides mcp integration logic to ClientAgent in getAgent, supporting agent tool execution.
   * @private
   */
  private readonly mcpConnectionService = inject<MCPConnectionService>(
    TYPES.mcpConnectionService
  );

  /**
   * Retrieves or creates a memoized ClientAgent instance for a given client and agent.
   * Uses functools-kit’s memoize to cache instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
   * Configures the agent with schema data (prompt, tools, completion) from AgentSchemaService, ToolSchemaService, and CompletionSchemaService, and initializes storage/state dependencies via StorageConnectionService and StateConnectionService.
   * Integrates with ClientAgent (agent logic), AgentPublicService (agent instantiation), and SessionValidationService (usage tracking).
   */
  public getAgent = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) => {
      const {
        prompt,
        system,
        operator,
        systemStatic = system,
        systemDynamic,
        tools,
        transform = GLOBAL_CONFIG.CC_AGENT_OUTPUT_TRANSFORM,
        map = GLOBAL_CONFIG.CC_AGENT_OUTPUT_MAP,
        maxToolCalls = GLOBAL_CONFIG.CC_MAX_TOOL_CALLS,
        mapToolCalls = GLOBAL_CONFIG.CC_AGENT_MAP_TOOLS,
        callbacks,
        storages,
        states,
        mcp,
        connectOperator = GLOBAL_CONFIG.CC_DEFAULT_CONNECT_OPERATOR,
        completion: completionName,
        validate = validateDefault,
      } = this.agentSchemaService.get(agentName);
      const history = this.historyConnectionService.getHistory(
        clientId,
        agentName
      );
      this.sessionValidationService.addAgentUsage(clientId, agentName);
      storages?.forEach((storageName) =>
        this.storageConnectionService
          .getStorage(clientId, storageName)
          .waitForInit()
      );
      states?.forEach((stateName) =>
        this.stateConnectionService
          .getStateRef(clientId, stateName)
          .waitForInit()
      );
      if (operator) {
        return new ClientOperator({
          clientId,
          agentName,
          bus: this.busService,
          history,
          logger: this.loggerService,
          connectOperator,
          ...callbacks,
        });
      }
      return new ClientAgent({
        clientId,
        agentName,
        validate,
        maxToolCalls,
        mapToolCalls,
        logger: this.loggerService,
        bus: this.busService,
        mcp: mcp
          ? new MergeMCP(mcp.map(this.mcpConnectionService.getMCP), agentName)
          : new NoopMCP(agentName),
        history,
        prompt,
        systemStatic,
        systemDynamic,
        transform,
        map,
        tools: tools?.map(this.toolSchemaService.get),
        completion: this.completionSchemaService.get(completionName),
        ...callbacks,
      });
    }
  );

  /**
   * Executes an input command on the agent in a specified execution mode.
   * Delegates to ClientAgent.execute, using context from MethodContextService to identify the agent, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors AgentPublicService’s execute, supporting ClientAgent’s EXECUTE_FN and PerfService’s tracking.
   */
  public execute = async (input: string, mode: ExecutionMode) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService execute`, {
        input,
        mode,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).execute(input, mode);
  };

  /**
   * Runs a stateless completion on the agent with the given input.
   * Delegates to ClientAgent.run, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors AgentPublicService’s run, supporting ClientAgent’s RUN_FN for quick completions.
   */
  public run = async (input: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService run`, {
        input,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).run(input);
  };

  /**
   * Waits for output from the agent, typically after an execution or run.
   * Delegates to ClientAgent.waitForOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with SessionPublicService’s waitForOutput and ClientAgent’s asynchronous output handling.
   */
  public waitForOutput = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService waitForOutput`);
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).waitForOutput();
  };

  /**
   * Commits tool output to the agent’s history, typically for OpenAI-style tool calls.
   * Delegates to ClientAgent.commitToolOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitToolOutput, supporting ClientAgent’s TOOL_EXECUTOR and HistoryPublicService.
   */
  public commitToolOutput = async (toolId: string, content: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitToolOutput`, {
        content,
        toolId,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitToolOutput(toolId, content);
  };

  /**
   * Commits a system message to the agent’s history.
   * Delegates to ClientAgent.commitSystemMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitSystemMessage, supporting ClientAgent’s system prompt updates and HistoryPublicService.
   */
  public commitSystemMessage = async (message: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitSystemMessage`, {
        message,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitSystemMessage(message);
  };

  /**
   * Commits a developer message to the agent’s history.
   * Delegates to ClientAgent.commitDeveloperMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitDeveloperMessage, supporting ClientAgent’s developer-specific messages and HistoryPublicService.
   * @throws {Error} If committing the message fails.
   */
  public commitDeveloperMessage = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitDeveloperMessage`, {
        message,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitDeveloperMessage(message);
  }

  /**
   * Commits a tool request to the agent’s history.
   * Delegates to ClientAgent.commitToolRequest, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitToolRequest, supporting ClientAgent’s tool request handling and HistoryPublicService.
   */
  public commitToolRequest = async (request: IToolRequest[]) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitToolRequest`, {
        request,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitToolRequest(request);
  };

  /**
   * Commits an assistant message to the agent’s history.
   * Delegates to ClientAgent.commitAssistantMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitAssistantMessage, supporting ClientAgent’s assistant responses and HistoryPublicService.
   */
  public commitAssistantMessage = async (message: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitAssistantMessage`, {
        message,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitAssistantMessage(message);
  };

  /**
   * Commits a user message to the agent’s history without triggering a response.
   * Delegates to ClientAgent.commitUserMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitUserMessage, supporting ClientAgent’s user input logging and HistoryPublicService.
   */
  public commitUserMessage = async (message: string, mode: ExecutionMode) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitUserMessage`, {
        message,
        mode,
      });
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitUserMessage(message, mode);
  };

  /**
   * Commits an agent change to prevent the next tool execution, altering the execution flow.
   * Delegates to ClientAgent.commitAgentChange, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s execution control, potentially tied to SwarmPublicService’s navigation changes.
   */
  public commitAgentChange = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitAgentChange`);
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitAgentChange();
  };

  /**
   * Prevents the next tool from being executed in the agent’s workflow.
   * Delegates to ClientAgent.commitStopTools, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitStopTools, supporting ClientAgent’s TOOL_EXECUTOR interruption.
   */
  public commitStopTools = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitStopTools`);
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitStopTools();
  };

  /**
   * Prevents the next tool from being executed in the agent’s workflow.
   * Delegates to ClientAgent.commitCancelOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitCancelOutput, supporting ClientAgent’s TOOL_EXECUTOR interruption.
   */
  public commitCancelOutput = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitCancelOutput`);
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitCancelOutput();
  };

  /**
   * Commits a flush of the agent’s history, clearing stored data.
   * Delegates to ClientAgent.commitFlush, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitFlush, supporting ClientAgent’s history reset and HistoryPublicService.
   */
  public commitFlush = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService commitFlush`);
    return await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).commitFlush();
  };

  /**
   * Disposes of the agent connection, cleaning up resources and clearing the memoized instance.
   * Checks if the agent exists in the memoization cache before calling ClientAgent.dispose, then clears the cache and updates SessionValidationService.
   * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with AgentPublicService’s dispose and PerfService’s cleanup.
   */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.agentName}`;
    if (!this.getAgent.has(key)) {
      return;
    }
    await this.getAgent(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).dispose();
    this.getAgent.clear(key);
    this.sessionValidationService.removeAgentUsage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    );
  };
}

/**
 * Default export of the AgentConnectionService class.
 * Provides the primary service for managing agent connections in the swarm system, integrating with ClientAgent, AgentPublicService, SessionPublicService, HistoryPublicService, and PerfService, with memoized agent instantiation.
 */
export default AgentConnectionService;
