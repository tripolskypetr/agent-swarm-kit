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
  private readonly perfService = inject<PerfService>(TYPES.perfService);
  private readonly sessionConnectionService = inject<SessionConnectionService>(
    TYPES.sessionConnectionService
  );
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Emits a message to the session.
   * @param {string} content - The content to emit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
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
      }
    );
  };

  /**
   * Run the completion stateless
   * @param {string} content - The content to execute.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
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
          this.perfService.startExecution(executionId, clientId, incoming.data.length);
          try {
            this.busService.commitExecutionBegin(clientId, { swarmName });
            const result = await send(incoming);
            isFinished = this.perfService.endExecution(executionId, clientId, result.length);
            this.busService.commitExecutionEnd(clientId, { swarmName });
            return result;
          } finally {
            if (!isFinished) {
              this.perfService.endExecution(executionId, clientId, 0);
            }
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
   * Commits tool output to the session.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param {string} content - The content to commit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
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
      }
    );
  };

  /**
   * Commits an assistant message to the session.
   * @param {string} message - The message to commit.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>``}
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
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitUserMessage(message);
      },
      {
        methodName,
        clientId,
        swarmName,
        policyName: "",
        agentName: "",
        storageName: "",
        stateName: "",
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
      }
    );
  };

  /**
   * Prevent the next tool from being executed
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
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
      }
    );
  };

  /**
   * Disposes of the session.
   * @param {string} clientId - The client ID.
   * @param {SwarmName} swarmName - The swarm name.
   * @returns {Promise<void>}
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
      }
    );
  };
}

export default SessionPublicService;
