import { inject } from "../../core/di";
import { SessionConnectionService } from "../connection/SessionConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import {
  ExecutionMode,
  ReceiveMessageFn,
  SendMessageFn,
} from "../../../interfaces/Session.interface";

interface ISessionConnectionService extends SessionConnectionService {}

type InternalKeys = keyof {
  getSession: never;
};

type TSessionConnectionService = {
  [key in Exclude<keyof ISessionConnectionService, InternalKeys>]: unknown;
};

/**
 * Service for managing public session interactions.
 */
export class SessionPublicService implements TSessionConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly sessionConnectionService = inject<SessionConnectionService>(
    TYPES.sessionConnectionService
  );

  /**
   * Emits a message to the session.
   * @param {string} content - The content to emit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public emit = async (
    content: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("sessionPublicService emit", {
      content,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.emit(content);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Executes a command in the session.
   * @param {string} content - The content to execute.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public execute = async (
    content: string,
    mode: ExecutionMode,
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("sessionPublicService execute", {
      content,
      mode,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.execute(content, mode);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Connects to the session.
   * @param {SendMessageFn} connector - The function to send messages.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {ReceiveMessageFn}
   */
  public connect = (
    connector: SendMessageFn,
    clientId: string,
    swarmName: SwarmName
  ): ReceiveMessageFn => {
    this.loggerService.log("sessionPublicService connect", {
      clientId,
      swarmName,
    });
    return ContextService.runInContext(
      () => {
        const receive = this.sessionConnectionService.connect(
          async (outgoing) => {
            return await ContextService.runInContext(
              async () => {
                return await connector(outgoing);
              },
              {
                clientId,
                swarmName,
                agentName: "",
              }
            );
          }
        );
        return (incoming) => {
          return ContextService.runInContext(
            () => {
              return receive(incoming);
            },
            {
              clientId,
              swarmName,
              agentName: "",
            }
          );
        };
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Commits tool output to the session.
   * @param {string} content - The content to commit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public commitToolOutput = async (
    content: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("sessionPublicService commitToolOutput", {
      content,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitToolOutput(content);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Commits a system message to the session.
   * @param {string} message - The message to commit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public commitSystemMessage = async (
    message: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("sessionPublicService commitSystemMessage", {
      message,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitSystemMessage(message);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Commits user message to the agent without answer.
   * @param {string} message - The message to commit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public commitUserMessage = async (
    message: string,
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("sessionPublicService commitUserMessage", {
      message,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitUserMessage(message);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Commits flush of agent history
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public commitFlush = async (
    clientId: string,
    swarmName: SwarmName
  ) => {
    this.loggerService.log("sessionPublicService commitFlush", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitFlush();
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  /**
   * Disposes of the session.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
   */
  public dispose = async (clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("sessionPublicService dispose", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.dispose();
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };
}

export default SessionPublicService;
