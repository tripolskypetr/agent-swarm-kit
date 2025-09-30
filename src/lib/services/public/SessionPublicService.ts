import { inject } from "../../core/di";
import { SessionConnectionService } from "../connection/SessionConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import {
  ExecutionMode,
  ReceiveMessageFn,
  SendMessageFn,
} from "../../../interfaces/Session.interface";
import ExecutionContextService from "../context/ExecutionContextService";
import { randomString } from "functools-kit";
import { IIncomingMessage } from "../../../model/EmitMessage.model";
import { GLOBAL_CONFIG } from "../../../config/params";
import PerfService from "../base/PerfService";
import BusService from "../base/BusService";
import NavigationValidationService from "../validation/NavigationValidationService";
import { IToolRequest } from "../../../model/Tool.model";
import ExecutionValidationService from "../validation/ExecutionValidationService";

/**
 * Interface extending SessionConnectionService for type definition purposes.
 * Used to define TSessionConnectionService by excluding internal keys, ensuring SessionPublicService aligns with public-facing operations.
*/
interface ISessionConnectionService extends SessionConnectionService {}

/**
 * Type representing keys to exclude from ISessionConnectionService (internal methods).
 * Used to filter out non-public methods like getSession in TSessionConnectionService.
*/
type InternalKeys = keyof {
  getSession: never;
};

/**
 * Type representing the public interface of SessionPublicService, derived from ISessionConnectionService.
 * Excludes internal methods (e.g., getSession) via InternalKeys, ensuring a consistent public API for session operations.
*/
type TSessionConnectionService = {
  [key in Exclude<keyof ISessionConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public session interactions in the swarm system.
 * Implements TSessionConnectionService to provide a public API for session-related operations, delegating to SessionConnectionService and wrapping calls with MethodContextService and ExecutionContextService for context scoping.
 * Integrates with ClientAgent (e.g., EXECUTE_FN, RUN_FN session execution), AgentPublicService (e.g., session-level messaging), PerfService (e.g., execution tracking in startExecution), BusService (e.g., commitExecutionBegin events), and SwarmMetaService (e.g., swarm context via swarmName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like message emission, execution, connection handling, message commits, and session disposal.
*/
export class SessionPublicService implements TSessionConnectionService {
  /**
   * Logger service instance, injected via DI, for logging session operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO or CC_LOGGER_ENABLE_LOG is true, consistent with AgentPublicService and PerfService logging patterns.
    */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Performance service instance, injected via DI, for tracking execution metrics.
   * Used in connect to measure execution duration (startExecution, endExecution), aligning with PerfService’s sessionState tracking.
    */
  private readonly perfService = inject<PerfService>(TYPES.perfService);

  /**
   * Service for execution validation to prevent the model to call the tools
   * recursively
    */
  private readonly executionValidationService = inject<ExecutionValidationService>(TYPES.executionValidationService);

  /**
   * Session connection service instance, injected via DI, for underlying session operations.
   * Provides core functionality (e.g., emit, execute) called by public methods, supporting ClientAgent’s session model.
    */
  private readonly sessionConnectionService = inject<SessionConnectionService>(
    TYPES.sessionConnectionService
  );

  /**
   * Bus service instance, injected via DI, for emitting session-related events.
   * Used in connect to signal execution start and end (commitExecutionBegin, commitExecutionEnd), integrating with BusService’s event system.
    */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Service which prevent tool call to navigate client recursively
    */
  private readonly navigationValidationService =
    inject<NavigationValidationService>(TYPES.navigationValidationService);

  /**
   * Emits a message to the session, typically for asynchronous communication.
   * Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.
    */
  public notify = async (
    content: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService notify", {
        content,
        clientId,
        methodName,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.notify(content);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Emits a message to the session for a specific client and swarm.
   * Wraps SessionConnectionService.emit with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., session-level messaging) and AgentPublicService (e.g., swarm context emission).
    */
  public emit = async (
    content: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService emit", {
        content,
        clientId,
        methodName,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.emit(content);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Executes a command in the session with a specified execution mode.
   * Wraps SessionConnectionService.execute with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors ClientAgent’s EXECUTE_FN at the session level, triggering BusService events and PerfService tracking.
   */
  public execute = async (
    content: string,
    mode: ExecutionMode,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService execute", {
        content,
        mode,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.execute(content, mode);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Runs a stateless completion in the session with the given content.
   * Wraps SessionConnectionService.run with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors ClientAgent’s RUN_FN at the session level, used for quick completions without state persistence.
    */
  public run = async (
    content: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService run", {
        content,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.run(content);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Connects to the session, establishing a messaging channel with performance tracking and event emission.
   * Uses SessionConnectionService.connect directly, wrapping execution in ExecutionContextService for detailed tracking, logging via LoggerService if enabled.
   * Integrates with ClientAgent (e.g., session-level messaging), PerfService (e.g., execution metrics), and BusService (e.g., execution events).
    */
  public connect = (
    connector: SendMessageFn,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ): ReceiveMessageFn<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService connect", {
        methodName,
        clientId,
        swarmName,
      });
    const send = this.sessionConnectionService.connect(
      connector,
      clientId,
      swarmName
    );
    return async (incoming: IIncomingMessage) => {
      const executionId = randomString();
      return ExecutionContextService.runInContext(
        async () => {
          GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
            this.loggerService.log("sessionPublicService connect execute", {
              content: incoming,
              methodName,
              clientId,
              executionId,
            });
          let isFinished = false;
          this.perfService.startExecution(
            executionId,
            clientId,
            incoming.data.length
          );
          this.navigationValidationService.beginMonit(clientId, swarmName);
          try {
            this.busService.commitExecutionBegin(clientId, { swarmName });
            const result = await send(incoming);
            isFinished = this.perfService.endExecution(
              executionId,
              clientId,
              result.length
            );
            this.busService.commitExecutionEnd(clientId, { swarmName });
            return result;
          } finally {
            if (!isFinished) {
              this.perfService.endExecution(executionId, clientId, 0);
            }
            this.executionValidationService.decrementCount(executionId, clientId, swarmName);
          }
        },
        {
          clientId,
          executionId,
          processId: GLOBAL_CONFIG.CC_PROCESS_UUID,
        }
      );
    };
  };

  /**
   * Commits tool output to the session’s history, typically for OpenAI-style tool calls.
   * Wraps SessionConnectionService.commitToolOutput with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s tool execution (e.g., TOOL_EXECUTOR), mirrored in AgentPublicService.
   */
  public commitToolOutput = async (
    toolId: string,
    content: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitToolOutput", {
        methodName,
        toolId,
        content,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitToolOutput(
          toolId,
          content
        );
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits a system message to the session’s history.
   * Wraps SessionConnectionService.commitSystemMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., system prompt updates), mirrored in AgentPublicService.
    */
  public commitSystemMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitSystemMessage", {
        methodName,
        message,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitSystemMessage(message);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits a developer message to the session’s history or state.
   * Wraps SessionConnectionService.commitDeveloperMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s developer-level messaging, allowing for detailed session context updates.
    */
  public commitDeveloperMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitDeveloperMessage", {
        methodName,
        message,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitDeveloperMessage(message);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits a tool request to the session’s history.
   * Wraps SessionConnectionService.commitToolRequest with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s tool execution requests, mirrored in AgentPublicService.
   * 
    */
  public commitToolRequest = async (
    request: IToolRequest[],
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitToolRequest", {
        methodName,
        request,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitToolRequest(request);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits an assistant message to the session’s history.
   * Wraps SessionConnectionService.commitAssistantMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s assistant responses, mirrored in AgentPublicService and tracked by PerfService.
    */
  public commitAssistantMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitAssistantMessage", {
        methodName,
        message,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitAssistantMessage(
          message
        );
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits a user message to the session’s history without triggering an answer.
   * Wraps SessionConnectionService.commitUserMessage with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent for user input logging, mirrored in AgentPublicService.
    */
  public commitUserMessage = async (
    message: string,
    mode: ExecutionMode,
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitUserMessage", {
        methodName,
        message,
        clientId,
        swarmName,
        mode,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitUserMessage(
          message,
          mode
        );
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits a flush of the session’s history, clearing stored data.
   * Wraps SessionConnectionService.commitFlush with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent session resets, mirrored in AgentPublicService and tracked by PerfService.
    */
  public commitFlush = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitFlush", {
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitFlush();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Commits a stop to prevent the next tool from being executed in the session.
   * Wraps SessionConnectionService.commitStopTools with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent’s tool execution control (e.g., TOOL_EXECUTOR interruption), mirrored in AgentPublicService.
    */
  public commitStopTools = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService commitStopTools", {
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitStopTools();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Disposes of the session, cleaning up resources.
   * Wraps SessionConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with AgentPublicService’s dispose and PerfService’s session cleanup.
    */
  public dispose = async (
    methodName: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionPublicService dispose", {
        methodName,
        clientId,
        swarmName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.dispose();
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };
}

/**
 * Default export of the SessionPublicService class.
 * Provides the primary public interface for session operations in the swarm system, integrating with ClientAgent, AgentPublicService, PerfService, BusService, and SwarmMetaService.
*/
export default SessionPublicService;
