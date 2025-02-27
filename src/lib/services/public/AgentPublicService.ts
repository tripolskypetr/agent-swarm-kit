import { inject } from "../../core/di";
import { AgentConnectionService } from "../connection/AgentConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
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
  public createAgentRef = async (requestId: string, clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService createAgentRef", {
      requestId,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.getAgent(clientId, agentName);
      },
      {
        requestId,
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
    requestId: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService execute", {
      requestId,
      input,
      clientId,
      agentName,
      mode,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.execute(input, mode);
      },
      {
        requestId,
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
  public waitForOutput = async (requestId: string, clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService waitForOutput", {
      requestId,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.waitForOutput();
      },
      {
        requestId,
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
    requestId: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitToolOutput", {
      requestId,
      content,
      clientId,
      toolId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitToolOutput(toolId, content);
      },
      {
        requestId,
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
    requestId: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitSystemMessage", {
      requestId,
      message,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitSystemMessage(message);
      },
      {
        requestId,
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
    requestId: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitUserMessage", {
      requestId,
      message,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitUserMessage(message);
      },
      {
        requestId,
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
    requestId: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitFlush", {
      requestId,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitFlush();
      },
      {
        requestId,
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
    requestId: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitAgentChange", {
      requestId,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitAgentChange();
      },
      {
        requestId,
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
  public dispose = async (requestId: string, clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService dispose", {
      requestId,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.dispose();
      },
      {
        requestId,
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
