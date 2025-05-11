import { inject } from "../../core/di";
import { AgentConnectionService } from "../connection/AgentConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { AgentName } from "../../../interfaces/Agent.interface";
import { ExecutionMode } from "../../../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { IToolRequest } from "../../../model/Tool.model";

/**
 * Interface extending AgentConnectionService for type definition purposes.
 * Used to define TAgentConnectionService by excluding internal keys, ensuring AgentPublicService aligns with public-facing operations.
 * @interface IAgentConnectionService
 */
interface IAgentConnectionService extends AgentConnectionService {}

/**
 * Type representing keys to exclude from IAgentConnectionService (internal methods).
 * Used to filter out non-public methods like getAgent in TAgentConnectionService.
 * @typedef {keyof { getAgent: never }} InternalKeys
 */
type InternalKeys = keyof {
  getAgent: never;
};

/**
 * Type representing the public interface of AgentPublicService, derived from IAgentConnectionService.
 * Excludes internal methods (e.g., getAgent) via InternalKeys, ensuring a consistent public API for agent operations.
 * @typedef {Object} TAgentConnectionService
 */
type TAgentConnectionService = {
  [key in Exclude<keyof IAgentConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public agent operations in the swarm system.
 * Implements TAgentConnectionService to provide a public API for agent interactions, delegating to AgentConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., EXECUTE_FN, RUN_FN execution), PerfService (e.g., execution tracking via execute), DocService (e.g., agent documentation via agentName), and BusService (e.g., execution events via clientId).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like agent creation, execution, message commits, and disposal.
 */
export class AgentPublicService implements TAgentConnectionService {
  /**
   * Logger service instance, injected via DI, for logging agent operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Agent connection service instance, injected via DI, for underlying agent operations.
   * Provides core functionality (e.g., getAgent, execute) called by public methods, aligning with ClientAgent’s execution model.
   * @type {AgentConnectionService}
   * @private
   */
  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  /**
   * Creates a reference to an agent for a specific client and method context.
   * Wraps AgentConnectionService.getAgent with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., to initialize agent refs) and PerfService (e.g., to track agent usage via clientId).
   * @param {string} methodName - The name of the method invoking the operation, logged and scoped in context.
   * @param {string} clientId - The client ID, tying to ClientAgent sessions and PerfService tracking.
   * @param {AgentName} agentName - The name of the agent, sourced from Agent.interface, used in DocService docs.
   * @returns {Promise<unknown>} A promise resolving to the agent reference object.
   */
  public createAgentRef = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService createAgentRef", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.getAgent(clientId, agentName);
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
   * Executes a command on the agent with a specified execution mode.
   * Wraps AgentConnectionService.execute with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors ClientAgent’s EXECUTE_FN, triggering BusService events (e.g., commitExecutionBegin) and PerfService tracking (e.g., startExecution).
   * @param {string} input - The command input to execute, passed to the agent.
   * @param {ExecutionMode} mode - The execution mode (e.g., stateless, stateful), sourced from Session.interface.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the execution result.
   */
  public execute = async (
    input: string,
    mode: ExecutionMode,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService execute", {
        methodName,
        input,
        clientId,
        agentName,
        mode,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.execute(input, mode);
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
   * Runs a stateless completion on the agent with the given input.
   * Wraps AgentConnectionService.run with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors ClientAgent’s RUN_FN, used for quick completions without state persistence, tracked by PerfService.
   * @param {string} input - The command input to run, passed to the agent.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the completion result.
   */
  public run = async (
    input: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService run", {
        methodName,
        input,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.run(input);
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
   * Waits for the agent’s output after an operation.
   * Wraps AgentConnectionService.waitForOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., post-execution output retrieval), complementing execute and run.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the agent’s output.
   */
  public waitForOutput = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService waitForOutput", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.waitForOutput();
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
   * Commits tool output to the agent’s history, typically for OpenAI-style tool calls.
   * Wraps AgentConnectionService.commitToolOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s tool execution (e.g., TOOL_EXECUTOR), documented in DocService (e.g., tool schemas).
   * @param {string} toolId - The tool_call_id for OpenAI history integration.
   * @param {string} content - The tool output content to commit.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the commit result.
   */
  public commitToolOutput = async (
    toolId: string,
    content: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitToolOutput", {
        methodName,
        content,
        clientId,
        toolId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitToolOutput(
          toolId,
          content
        );
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
   * Commits a system message to the agent’s history.
   * Wraps AgentConnectionService.commitSystemMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., system prompt updates), documented in DocService (e.g., system prompts).
   * @param {string} message - The system message to commit.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the commit result.
   */
  public commitSystemMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitSystemMessage", {
        methodName,
        message,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitSystemMessage(message);
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
   * Commits a tool request to the agent’s history.
   * Wraps AgentConnectionService.commitToolRequest with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used for submitting tool requests, typically in scenarios where multiple tools are involved in agent operations.
   *
   * @param {IToolRequest[]} request - An array of tool requests to commit.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the commit result.
   */
  public commitToolRequest = async (
    request: IToolRequest[],
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitToolRequest", {
        methodName,
        request,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitToolRequest(request);
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
   * Commits an assistant message to the agent’s history.
   * Wraps AgentConnectionService.commitAssistantMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s assistant responses, tracked by PerfService and documented in DocService.
   * @param {string} message - The assistant message to commit.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the commit result.
   */
  public commitAssistantMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitAssistantMessage", {
        methodName,
        message,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitAssistantMessage(
          message
        );
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
   * Commits a user message to the agent’s history without triggering an answer.
   * Wraps AgentConnectionService.commitUserMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent for user input logging, complementing execute and run.
   * @param {string} message - The user message to commit.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the commit result.
   */
  public commitUserMessage = async (
    message: string,
    mode: ExecutionMode,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitUserMessage", {
        methodName,
        message,
        clientId,
        agentName,
        mode,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitUserMessage(
          message,
          mode
        );
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
   * Commits a flush of the agent’s history, clearing stored data.
   * Wraps AgentConnectionService.commitFlush with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent session resets, tracked by PerfService for performance cleanup.
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the flush result.
   */
  public commitFlush = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitFlush", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitFlush();
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
   * Commits a change of agent to prevent subsequent tool executions.
   * Wraps AgentConnectionService.commitAgentChange with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent to manage agent transitions, documented in DocService (e.g., agent dependencies).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the change result.
   */
  public commitAgentChange = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitAgentChange", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitAgentChange();
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
   * Commits a stop to prevent the next tool from being executed.
   * Wraps AgentConnectionService.commitStopTools with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s tool execution control (e.g., TOOL_EXECUTOR interruption).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the stop result.
   */
  public commitStopTools = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService commitStopTools", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitStopTools();
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
   * Disposes of the agent, cleaning up resources.
   * Wraps AgentConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with PerfService’s dispose (e.g., session cleanup) and BusService’s dispose (e.g., subscription cleanup).
   * @param {string} methodName - The method name for context and logging.
   * @param {string} clientId - The client ID for session tracking.
   * @param {AgentName} agentName - The agent name for identification.
   * @returns {Promise<unknown>} A promise resolving to the dispose result.
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentPublicService dispose", {
        methodName,
        clientId,
        agentName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.dispose();
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
 * Default export of the AgentPublicService class.
 * Provides the primary public interface for agent operations in the swarm system, integrating with ClientAgent, PerfService, DocService, and BusService.
 * @type {typeof AgentPublicService}
 */
export default AgentPublicService;
