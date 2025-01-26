import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { TContextService } from "../base/ContextService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import ClientSession from "../../../client/ClientSession";
import SwarmConnectionService from "./SwarmConnectionService";
import {
  ISession,
  ReceiveMessageFn,
  SendMessageFn,
} from "../../../interfaces/Session.interface";

/**
 * Service for managing session connections.
 * @implements {ISession}
 */
export class SessionConnectionService implements ISession {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  /**
   * Retrieves a memoized session based on clientId and swarmName.
   * @param {string} clientId - The client ID.
   * @param {string} swarmName - The swarm name.
   * @returns {ClientSession} The client session.
   */
  public getSession = memoize(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    (clientId: string, swarmName: string) =>
      new ClientSession({
        clientId,
        logger: this.loggerService,
        swarm: this.swarmConnectionService.getSwarm(clientId, swarmName),
      })
  );

  /**
   * Emits a message to the session.
   * @param {string} content - The content to emit.
   * @returns {Promise<void>} A promise that resolves when the message is emitted.
   */
  public emit = async (content: string) => {
    this.loggerService.log(`sessionConnectionService emit`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).emit(content);
  };

  /**
   * Executes a command in the session.
   * @param {string} content - The content to execute.
   * @returns {Promise<string>} A promise that resolves with the execution result.
   */
  public execute = async (content: string): Promise<string> => {
    this.loggerService.log(`sessionConnectionService execute`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).execute(content);
  };

  /**
   * Connects to the session using the provided connector.
   * @param {SendMessageFn} connector - The function to send messages.
   * @returns {ReceiveMessageFn} The function to receive messages.
   */
  public connect = (connector: SendMessageFn): ReceiveMessageFn => {
    this.loggerService.log(`sessionConnectionService connect`, {
      context: this.contextService.context,
    });
    return this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).connect(connector);
  };

  /**
   * Commits tool output to the session.
   * @param {string} content - The content to commit.
   * @returns {Promise<void>} A promise that resolves when the content is committed.
   */
  public commitToolOutput = async (content: string): Promise<void> => {
    this.loggerService.log(`sessionConnectionService commitToolOutput`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).commitToolOutput(content);
  };

  /**
   * Commits a system message to the session.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
   */
  public commitSystemMessage = async (message: string): Promise<void> => {
    this.loggerService.log(`sessionConnectionService commitSystemMessage`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).commitSystemMessage(message);
  };

  /**
   * Disposes of the session connection service.
   * @returns {Promise<void>} A promise that resolves when the service is disposed.
   */
  public dispose = async () => {
    this.loggerService.log(`sessionConnectionService dispose`, {
      context: this.contextService.context,
    });
    this.getSession.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.swarmName}`
    );
  };
}

export default SessionConnectionService;
