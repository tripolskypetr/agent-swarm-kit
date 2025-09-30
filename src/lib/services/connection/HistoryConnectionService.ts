import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IHistory from "../../../interfaces/History.interface";
import { IModelMessage } from "../../../model/ModelMessage.model";
import { memoize } from "functools-kit";
import ClientHistory from "../../../client/ClientHistory";
import { TMethodContextService } from "../context/MethodContextService";
import SessionValidationService from "../validation/SessionValidationService";
import { GLOBAL_CONFIG } from "../../../config/params";
import BusService from "../base/BusService";
import AgentSchemaService from "../schema/AgentSchemaService";

/**
 * Service class for managing history connections and operations in the swarm system.
 * Implements IHistory to provide an interface for history instance management, message manipulation, and conversion, scoped to clientId and agentName.
 * Integrates with ClientAgent (history in agent execution), AgentConnectionService (history provision), HistoryPublicService (public history API), SessionPublicService (session context), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientHistory instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SessionValidationService for usage tracking and BusService for event emission.
 * @implements {IHistory}
*/
export class HistoryConnectionService implements IHistory {
  /**
   * Logger service instance, injected via DI, for logging history operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with HistoryPublicService and PerfService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting history-related events.
   * Passed to ClientHistory for event propagation (e.g., history updates), aligning with BusService’s event system in AgentConnectionService.
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve clientId and agentName in method calls, integrating with MethodContextService’s scoping in HistoryPublicService.
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Session validation service instance, injected via DI, for tracking history usage.
   * Used in getHistory and dispose to manage history lifecycle, supporting SessionPublicService’s validation needs.
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Agent schema service instance, injected via DI, for managing agent schema-related operations.
   * Used to validate and process agent schemas within the history connection service.
   * @private
   */
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService,
  );

  /**
   * Retrieves or creates a memoized ClientHistory instance for a given client and agent.
   * Uses functools-kit’s memoize to cache instances by a composite key (clientId-agentName), ensuring efficient reuse across calls.
   * Initializes the history with items from GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER, and integrates with SessionValidationService for usage tracking.
   * Supports ClientAgent (history in EXECUTE_FN), AgentConnectionService (history provision), and HistoryPublicService (public API).
   */
  public getHistory = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) => {
      this.sessionValidationService.addHistoryUsage(clientId, agentName);
      const { keepMessages = GLOBAL_CONFIG.CC_KEEP_MESSAGES } = this.agentSchemaService.get(agentName);
      return new ClientHistory({
        clientId,
        agentName,
        keepMessages,
        bus: this.busService,
        items: GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER(clientId, agentName),
        logger: this.loggerService,
      });
    }
  );

  /**
   * Pushes a message to the agent’s history.
   * Delegates to ClientHistory.push, using context from MethodContextService to identify the history instance, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors HistoryPublicService’s push, supporting ClientAgent’s history updates (e.g., via commit methods in AgentConnectionService).
   */
  public push = async (message: IModelMessage) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`historyConnectionService push`, {
        message,
      });
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).push(message);
  };

  /**
   * Pops the most recent message from the agent’s history.
   * Delegates to ClientHistory.pop, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors HistoryPublicService’s pop, supporting ClientAgent’s history manipulation.
   */
  public pop = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`historyConnectionService pop`);
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).pop();
  };

  /**
   * Converts the agent’s history to an array formatted for agent use, incorporating a prompt.
   * Delegates to ClientHistory.toArrayForAgent, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors HistoryPublicService’s toArrayForAgent, supporting ClientAgent’s execution context (e.g., EXECUTE_FN with prompt).
   */
  public toArrayForAgent = async (prompt: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`historyConnectionService toArrayForAgent`, {
        prompt,
      });
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).toArrayForAgent(prompt);
  };

  /**
   * Converts the agent’s history to a raw array of messages.
   * Delegates to ClientHistory.toArrayForRaw, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors HistoryPublicService’s toArrayForRaw, supporting ClientAgent’s raw history access or external reporting.
   */
  public toArrayForRaw = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`historyConnectionService toArrayForRaw`);
    return await this.getHistory(
      this.methodContextService.context.clientId,
      this.methodContextService.context.agentName
    ).toArrayForRaw();
  };

  /**
   * Disposes of the history connection, cleaning up resources and clearing the memoized instance.
   * Checks if the history exists in the memoization cache before calling ClientHistory.dispose, then clears the cache and updates SessionValidationService.
   * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with HistoryPublicService’s dispose and PerfService’s cleanup.
   */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`historyConnectionService dispose`);
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

/**
 * Default export of the HistoryConnectionService class.
 * Provides the primary service for managing history connections in the swarm system, integrating with ClientAgent, AgentConnectionService, HistoryPublicService, SessionPublicService, and PerfService, with memoized history instantiation.
*/
export default HistoryConnectionService;
