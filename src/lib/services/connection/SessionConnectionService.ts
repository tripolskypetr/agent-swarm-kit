import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { TMethodContextService } from "../context/MethodContextService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import ClientSession from "../../../client/ClientSession";
import SwarmConnectionService from "./SwarmConnectionService";
import { GLOBAL_CONFIG } from "../../../config/params";
import {
  ExecutionMode,
  ISession,
  ReceiveMessageFn,
  SendMessageFn,
} from "../../../interfaces/Session.interface";
import SwarmSchemaService from "../schema/SwarmSchemaService";
import BusService from "../base/BusService";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import PolicyConnectionService from "./PolicyConnectionService";
import { MergePolicy, NoopPolicy } from "../../../classes/Policy";
import { IToolRequest } from "../../../model/Tool.model";

/**
 * Service class for managing session connections and operations in the swarm system.
 * Implements ISession to provide an interface for session instance management, messaging, execution, and lifecycle operations, scoped to clientId and swarmName.
 * Integrates with ClientAgent (agent execution within sessions), SessionPublicService (public session API), SwarmPublicService (swarm-level operations), PolicyPublicService (policy enforcement), AgentConnectionService (agent integration), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientSession instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with SwarmConnectionService for swarm access, PolicyConnectionService for policy enforcement, and SwarmSchemaService for swarm configuration.
 * @implements {ISession}
*/
export class SessionConnectionService implements ISession {
  /**
   * Logger service instance, injected via DI, for logging session operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionPublicService and PerfService logging patterns.
   * @private
  */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting session-related events.
   * Passed to ClientSession for event propagation (e.g., execution events), aligning with BusService’s event system in AgentConnectionService.
   * @private
  */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve clientId and swarmName in method calls, integrating with MethodContextService’s scoping in SessionPublicService.
   * @private
  */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Swarm connection service instance, injected via DI, for managing swarm instances.
   * Provides swarm access to ClientSession in getSession, supporting SwarmPublicService’s swarm-level operations.
   * @private
  */
  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  /**
   * Policy connection service instance, injected via DI, for managing policy instances.
   * Provides policy enforcement to ClientSession in getSession, integrating with PolicyPublicService and PolicyConnectionService.
   * @private
  */
  private readonly policyConnectionService = inject<PolicyConnectionService>(
    TYPES.policyConnectionService
  );

  /**
   * Swarm schema service instance, injected via DI, for retrieving swarm configurations.
   * Provides callbacks and policies to ClientSession in getSession, aligning with SwarmMetaService’s schema management.
   * @private
  */
  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Retrieves or creates a memoized ClientSession instance for a given client and swarm.
   * Uses functools-kit’s memoize to cache instances by a composite key (clientId-swarmName), ensuring efficient reuse across calls.
   * Configures the session with swarm data from SwarmSchemaService, policies from PolicyConnectionService (merged via MergePolicy or defaulting to NoopPolicy), and swarm access from SwarmConnectionService.
   * Supports ClientAgent (session context for execution), SessionPublicService (public API), and SwarmPublicService (swarm integration).
  */
  public getSession = memoize(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    (clientId: string, swarmName: string) => {
      const { callbacks, policies } = this.swarmSchemaService.get(swarmName);
      return new ClientSession({
        clientId,
        policy: policies
          ? new MergePolicy(
            policies.map(this.policyConnectionService.getPolicy),
            swarmName,
          )
          : new NoopPolicy(swarmName),
        logger: this.loggerService,
        bus: this.busService,
        swarm: this.swarmConnectionService.getSwarm(clientId, swarmName),
        swarmName,
        ...callbacks,
      });
    }
  );

  /**
   * Sends a notification message to connect listeners via the internal `_notifySubject`.
   * Logs the notification if debugging is enabled.
   * 
  */
  public notify = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService notify`, {
        message,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).notify(message);
  };

  /**
   * Emits a message to the session, typically for asynchronous communication.
   * Delegates to ClientSession.emit, using context from MethodContextService to identify the session, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s emit, supporting ClientAgent’s output handling and SwarmPublicService’s messaging.
  */
  public emit = async (content: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService emit`, {
        content,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).emit(content);
  };

  /**
   * Executes a command in the session with a specified execution mode.
   * Delegates to ClientSession.execute, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s execute, supporting ClientAgent’s EXECUTE_FN within a session context and PerfService tracking.
  */
  public execute = async (
    content: string,
    mode: ExecutionMode
  ): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService execute`, {
        content,
        mode,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).execute(content, mode);
  };

  /**
   * Runs a stateless completion in the session with the given content.
   * Delegates to ClientSession.run, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s run, supporting ClientAgent’s RUN_FN within a session context.
  */
  public run = async (content: string): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService run`, {
        content,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).run(content);
  };

  /**
   * Connects to the session using a provided send message function, returning a receive message function.
   * Delegates to ClientSession.connect, explicitly passing clientId and swarmName, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s connect, supporting ClientAgent’s bidirectional communication and SwarmPublicService’s swarm interactions.
  */
  public connect = (
    connector: SendMessageFn,
    clientId: string,
    swarmName: SwarmName
  ): ReceiveMessageFn<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService connect`);
    return this.getSession(clientId, swarmName).connect(connector);
  };

  /**
   * Commits tool output to the session’s history, typically for OpenAI-style tool calls.
   * Delegates to ClientSession.commitToolOutput, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitToolOutput, supporting ClientAgent’s TOOL_EXECUTOR and HistoryPublicService integration.
  */
  public commitToolOutput = async (
    toolId: string,
    content: string
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitToolOutput`, {
        content,
        toolId,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitToolOutput(toolId, content);
  };

  /**
   * Commits a system message to the session’s history.
   * Delegates to ClientSession.commitSystemMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitSystemMessage, supporting ClientAgent’s system updates and HistoryPublicService.
  */
  public commitSystemMessage = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitSystemMessage`, {
        message,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitSystemMessage(message);
  };

  /**
   * Commits a developer message to the session’s history.
   * Delegates to ClientSession.commitDeveloperMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitDeveloperMessage, supporting ClientAgent’s developer updates and HistoryPublicService.
   * @throws {Error} If committing the message fails.
  */
  public commitDeveloperMessage = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitDeveloperMessage`, {
        message,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitDeveloperMessage(message);
  };

  /**
   * Commits a tool request to the session’s history.
   * Delegates to ClientSession.commitToolRequest, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitToolRequest, supporting ClientAgent’s tool requests and HistoryPublicService integration.
   * 
  */
  public commitToolRequest = async (request: IToolRequest[]): Promise<string[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitToolRequest`, {
        request,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitToolRequest(request);
  };

  /**
   * Commits an assistant message to the session’s history.
   * Delegates to ClientSession.commitAssistantMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitAssistantMessage, supporting ClientAgent’s assistant responses and HistoryPublicService.
  */
  public commitAssistantMessage = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(
        `sessionConnectionService commitAssistantMessage`,
        {
          message,
        }
      );
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitAssistantMessage(message);
  };

  /**
   * Commits a user message to the session’s history without triggering a response.
   * Delegates to ClientSession.commitUserMessage, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitUserMessage, supporting ClientAgent’s user input logging and HistoryPublicService.
  */
  public commitUserMessage = async (message: string, mode: ExecutionMode): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitUserMessage`, {
        message,
        mode,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitUserMessage(message, mode);
  };

  /**
   * Commits a flush of the session’s history, clearing stored data.
   * Delegates to ClientSession.commitFlush, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitFlush, supporting ClientAgent’s history reset and HistoryPublicService.
  */
  public commitFlush = async (): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitFlush`);
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitFlush();
  };

  /**
   * Prevents the next tool from being executed in the session’s workflow.
   * Delegates to ClientSession.commitStopTools, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SessionPublicService’s commitStopTools, supporting ClientAgent’s TOOL_EXECUTOR interruption.
  */
  public commitStopTools = async (): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitStopTools`);
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitStopTools();
  };

  /**
   * Disposes of the session connection, cleaning up resources and clearing the memoized instance.
   * Checks if the session exists in the memoization cache before calling ClientSession.dispose, then clears the cache.
   * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with SessionPublicService’s dispose and PerfService’s cleanup.
  */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.swarmName}`;
    if (!this.getSession.has(key)) {
      return;
    }
    await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).dispose();
    this.getSession.clear(key);
  };
}

/**
 * Default export of the SessionConnectionService class.
 * Provides the primary service for managing session connections in the swarm system, integrating with ClientAgent, SessionPublicService, SwarmPublicService, PolicyPublicService, AgentConnectionService, and PerfService, with memoized session instantiation.
*/
export default SessionConnectionService;
