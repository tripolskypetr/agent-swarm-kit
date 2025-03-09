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

/**
 * Service for managing session connections.
 * @implements {ISession}
 */
export class SessionConnectionService implements ISession {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  private readonly policyConnectionService = inject<PolicyConnectionService>(
    TYPES.policyConnectionService
  );

  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Retrieves a memoized session based on clientId and swarmName.
   * @param {string} clientId - The client ID.
   * @param {string} swarmName - The swarm name.
   * @returns {ClientSession} The client session.
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
   * Emits a message to the session.
   * @param {string} content - The content to emit.
   * @returns {Promise<void>} A promise that resolves when the message is emitted.
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
   * Executes a command in the session.
   * @param {string} content - The content to execute.
   * @returns {Promise<string>} A promise that resolves with the execution result.
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
   * Run the completion stateless
   * @param {string} content - The content to execute.
   * @returns {Promise<string>} A promise that resolves with the execution result.
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
   * Connects to the session using the provided connector.
   * @param {SendMessageFn} connector - The function to send messages.
   * @returns {ReceiveMessageFn} The function to receive messages.
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
   * Commits tool output to the session.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param {string} content - The content to commit.
   * @returns {Promise<void>} A promise that resolves when the content is committed.
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
   * Commits a system message to the session.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
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
   * Commits an assistant message to the session.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
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
   * Commits user message to the agent without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
   */
  public commitUserMessage = async (message: string): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sessionConnectionService commitUserMessage`, {
        message,
      });
    return await this.getSession(
      this.methodContextService.context.clientId,
      this.methodContextService.context.swarmName
    ).commitUserMessage(message);
  };

  /**
   * Commits user message to the agent without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
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
   * Commits user message to the agent without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
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
   * Disposes of the session connection service.
   * @returns {Promise<void>} A promise that resolves when the service is disposed.
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

export default SessionConnectionService;
