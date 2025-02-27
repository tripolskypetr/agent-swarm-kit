import { inject } from "../../core/di";
import { AgentConnectionService } from "../connection/AgentConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { AgentName } from "../../../interfaces/Agent.interface";
import { ExecutionMode } from "../../../interfaces/Session.interface";

interface IAgentConnectionService extends AgentConnectionService {}

type InternalKeys = keyof {
  getAgent: never;
};

type TAgentConnectionService = {
  [key in Exclude<keyof IAgentConnectionService, InternalKeys>]: unknown;
};

/**
 * Service for managing public agent operations.
 */
export class AgentPublicService implements TAgentConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  /**
   * Creates a reference to an agent.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The agent reference.
   */
  public createAgentRef = async (methodName: string, clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService createAgentRef", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Executes a command on the agent.
   * @param {string} input - The input command.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The execution result.
   */
  public execute = async (
    input: string,
    mode: ExecutionMode,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService execute", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Waits for the agent's output.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The output result.
   */
  public waitForOutput = async (methodName: string, clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService waitForOutput", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Commits tool output to the agent.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param {string} content - The content to commit.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The commit result.
   */
  public commitToolOutput = async (
    toolId: string,
    content: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitToolOutput", {
      methodName,
      content,
      clientId,
      toolId,
      agentName,
    });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitToolOutput(toolId, content);
      },
      {
        methodName,
        clientId,
        agentName,
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Commits a system message to the agent.
   * @param {string} message - The message to commit.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The commit result.
   */
  public commitSystemMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitSystemMessage", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Commits user message to the agent without answer.
   * @param {string} message - The message to commit.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The commit result.
   */
  public commitUserMessage = async (
    message: string,
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitUserMessage", {
      methodName,
      message,
      clientId,
      agentName,
    });
    return await MethodContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitUserMessage(message);
      },
      {
        methodName,
        clientId,
        agentName,
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Commits flush of agent history
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The commit result.
   */
  public commitFlush = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitFlush", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Commits change of agent to prevent the next tool execution from being called.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The commit result.
   */
  public commitAgentChange = async (
    methodName: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitAgentChange", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };

  /**
   * Disposes of the agent.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The dispose result.
   */
  public dispose = async (methodName: string, clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService dispose", {
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
        swarmName: "",
        storageName: "",
        stateName: "",
      }
    );
  };
}

export default AgentPublicService;
