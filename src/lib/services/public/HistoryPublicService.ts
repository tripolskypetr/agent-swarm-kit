import { inject } from "../../core/di";
import { HistoryConnectionService } from "../connection/HistoryConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { ISwarmMessage } from "../../../contract/SwarmMessage.contract";
import { AgentName } from "../../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Interface extending HistoryConnectionService for type definition purposes.
 * Used to define THistoryConnectionService by excluding internal keys, ensuring HistoryPublicService aligns with public-facing operations.
*/
interface IHistoryConnectionService extends HistoryConnectionService {}

/**
 * Type representing keys to exclude from IHistoryConnectionService (internal methods).
 * Used to filter out non-public methods like getHistory and getItems in THistoryConnectionService.
*/
type InternalKeys = keyof {
  getHistory: never;
  getItems: never;
};

/**
 * Type representing the public interface of HistoryPublicService, derived from IHistoryConnectionService.
 * Excludes internal methods (e.g., getHistory, getItems) via InternalKeys, ensuring a consistent public API for history operations.
*/
type THistoryConnectionService = {
  [key in Exclude<keyof IHistoryConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public history operations in the swarm system.
 * Implements THistoryConnectionService to provide a public API for history interactions, delegating to HistoryConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., message history in EXECUTE_FN), AgentPublicService (e.g., commitSystemMessage pushing to history), PerfService (e.g., session tracking via clientId), and DocService (e.g., history documentation).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like pushing messages, popping messages, converting history to arrays, and disposal.
*/
export class HistoryPublicService implements THistoryConnectionService {
  /**
   * Logger service instance, injected via DI, for logging history operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentPublicService and DocService logging patterns.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * History connection service instance, injected via DI, for underlying history operations.
   * Provides core functionality (e.g., push, pop) called by public methods, aligning with ClientAgent’s history management.
   */
  private readonly historyConnectionService = inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  );

  /**
   * Pushes a message to the agent’s history for a specific client and method context.
   * Wraps HistoryConnectionService.push with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in AgentPublicService (e.g., commitSystemMessage, commitUserMessage) and ClientAgent (e.g., EXECUTE_FN message logging).
   */
  public push = async (
    message: ISwarmMessage,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
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
        policyName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Pops the most recent message from the agent’s history.
   * Wraps HistoryConnectionService.pop with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., retrieving last message in EXECUTE_FN) and AgentPublicService (e.g., history manipulation).
   */
  public pop = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("historyPublicService pop", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.historyConnectionService.pop();
      },
      {
        methodName,
        clientId,
        agentName,
        policyName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Converts the agent's history to an array tailored for agent processing, incorporating a prompt.
   * Wraps HistoryConnectionService.toArrayForAgent with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., EXECUTE_FN context preparation) and DocService (e.g., history documentation with prompts).
   */
  public toArrayForAgent = async (
    prompt: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
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
        policyName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Converts the agent’s history to a raw array of items.
   * Wraps HistoryConnectionService.toArrayForRaw with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., raw history access in EXECUTE_FN) and PerfService (e.g., history-based performance metrics).
   */
  public toArrayForRaw = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
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
        policyName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Disposes of the agent’s history, cleaning up resources.
   * Wraps HistoryConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with AgentPublicService’s dispose (e.g., agent cleanup) and PerfService’s dispose (e.g., session cleanup).
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
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
        policyName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };
}

/**
 * Default export of the HistoryPublicService class.
 * Provides the primary public interface for history operations in the swarm system, integrating with ClientAgent, AgentPublicService, PerfService, and DocService.
*/
export default HistoryPublicService;
