import { inject } from "../../core/di";
import { AgentConnectionService } from "../connection/AgentConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
import { AgentName } from "../../../interfaces/Agent.interface";

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
  public createAgentRef = async (clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService createAgentRef", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.getAgent(clientId, agentName);
      },
      {
        clientId,
        agentName,
        swarmName: "",
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
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService execute", {
      input,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.execute(input);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  /**
   * Waits for the agent's output.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The output result.
   */
  public waitForOutput = async (clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService waitForOutput", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.waitForOutput();
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  /**
   * Commits tool output to the agent.
   * @param {string} content - The content to commit.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The commit result.
   */
  public commitToolOutput = async (
    content: string,
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitToolOutput", {
      content,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitToolOutput(content);
      },
      {
        clientId,
        agentName,
        swarmName: "",
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
    clientId: string,
    agentName: AgentName
  ) => {
    this.loggerService.log("agentPublicService commitSystemMessage", {
      message,
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.commitSystemMessage(message);
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };

  /**
   * Disposes of the agent.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<unknown>} The dispose result.
   */
  public dispose = async (clientId: string, agentName: AgentName) => {
    this.loggerService.log("agentPublicService dispose", {
      clientId,
      agentName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.agentConnectionService.dispose();
      },
      {
        clientId,
        agentName,
        swarmName: "",
      }
    );
  };
}

export default AgentPublicService;
