import { not, Subject } from "functools-kit";
import { IIncomingMessage } from "../model/EmitMessage.model";

import {
  ExecutionMode,
  ISessionParams,
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { ISession } from "../interfaces/Session.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Represents a client session for managing message execution, emission, and agent interactions.
 * @implements {ISession}
 */
export class ClientSession implements ISession {
  /**
   * Subject for emitting output messages to subscribers.
   */
  readonly _emitSubject = new Subject<string>();

  /**
   * Constructs a new ClientSession instance.
   * Invokes the onInit callback if provided.
   * @param {ISessionParams} params - The parameters for initializing the session.
   */
  constructor(readonly params: ISessionParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} CTOR`,
        {
          params,
        }
      );
    this.params.onInit && this.params.onInit(params.clientId, params.swarmName);
  }

  /**
   * Emits a message to subscribers after validating it against the policy.
   * If validation fails, emits the ban message instead.
   * @param {string} message - The message to emit.
   * @returns {Promise<void>}
   */
  async emit(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} emit`,
        {
          message,
        }
      );
    if (
      await not(
        this.params.policy.validateOutput(
          message,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} emit method canceled due to the banhammer of a client`,
          {
            message,
          }
        );
      await this._emitSubject.next(
        await this.params.policy.getBanMessage(
          this.params.clientId,
          this.params.swarmName
        )
      );
      return;
    }
    this.params.onEmit &&
      this.params.onEmit(this.params.clientId, this.params.swarmName, message);
    await this._emitSubject.next(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "emit",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Executes a message using the swarm's agent and returns the output.
   * Validates input and output against the policy, returning a ban message if either fails.
   * @param {string} message - The message to execute.
   * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool").
   * @returns {Promise<string>} The output of the execution, or a ban message if validation fails.
   */
  async execute(message: string, mode: ExecutionMode): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} execute`,
        {
          message,
          mode,
        }
      );
    if (
      await not(
        this.params.policy.validateInput(
          message,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} execution canceled due to the banhammer of a client`,
          {
            message,
            mode,
          }
        );
      return await this.params.policy.getBanMessage(
        this.params.clientId,
        this.params.swarmName
      );
    }
    this.params.onExecute &&
      this.params.onExecute(
        this.params.clientId,
        this.params.swarmName,
        message,
        mode
      );
    const agent = await this.params.swarm.getAgent();
    const outputAwaiter = this.params.swarm.waitForOutput();
    agent.execute(message, mode);
    const output = await outputAwaiter;
    if (
      await not(
        this.params.policy.validateOutput(
          output,
          this.params.clientId,
          this.params.swarmName
        )
      )
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} execution output emit canceled due to the banhammer of a client`,
          {
            message,
            mode,
          }
        );
      return await this.params.policy.getBanMessage(
        this.params.clientId,
        this.params.swarmName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "execute",
      source: "session-bus",
      input: {
        message,
        mode,
      },
      output: {
        result: output,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return output;
  }

  /**
   * Runs a stateless completion of a message using the swarm's agent and returns the output.
   * Does not emit the result but logs the execution via the event bus.
   * @param {string} message - The message to run.
   * @returns {Promise<string>} The output of the completion.
   */
  async run(message: string): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} run`,
        {
          message,
        }
      );
    this.params.onRun &&
      this.params.onRun(this.params.clientId, this.params.swarmName, message);
    const agent = await this.params.swarm.getAgent();
    const output = await agent.run(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "run",
      source: "session-bus",
      input: {
        message,
      },
      output: {
        result: output,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return output;
  }

  /**
   * Commits tool output to the agent's history via the swarm.
   * @param {string} toolId - The ID of the tool call (e.g., `tool_call_id` for OpenAI history).
   * @param {string} content - The tool output content to commit.
   * @returns {Promise<void>}
   */
  async commitToolOutput(toolId: string, content: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitToolOutput`,
        {
          content,
          toolId,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitToolOutput(toolId, content);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-tool-output",
      source: "session-bus",
      input: {
        toolId,
        content,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits a user message to the agent's history without triggering a response.
   * @param {string} message - The user message to commit.
   * @returns {Promise<void>}
   */
  async commitUserMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitUserMessage`,
        {
          message,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitUserMessage(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-user-message",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits a flush of the agent's history, clearing it.
   * @returns {Promise<void>}
   */
  async commitFlush(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitFlush`
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitFlush();
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-flush",
      source: "session-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Signals the agent to stop the execution of subsequent tools.
   * @returns {Promise<void>}
   */
  async commitStopTools(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitStopTools`
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitStopTools();
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-stop-tools",
      source: "session-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits a system message to the agent's history.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  async commitSystemMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitSystemMessage`,
        {
          message,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitSystemMessage(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-system-message",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Commits an assistant message to the agent's history without triggering execution.
   * @param {string} message - The assistant message to commit.
   * @returns {Promise<void>}
   */
  async commitAssistantMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} commitAssistantMessage`,
        {
          message,
        }
      );
    const agent = await this.params.swarm.getAgent();
    const result = await agent.commitAssistantMessage(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-assistant-message",
      source: "session-bus",
      input: {
        message,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Connects the session to a message connector, subscribing to emitted messages and returning a receiver function.
   * @param {SendMessageFn} connector - The function to handle outgoing messages.
   * @returns {ReceiveMessageFn<string>} A function to receive incoming messages and process them.
   */
  connect(connector: SendMessageFn): ReceiveMessageFn<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} connect`
      );
    this.params.onConnect &&
      this.params.onConnect(this.params.clientId, this.params.swarmName);
    this._emitSubject.subscribe(
      async (data: string) =>
        await connector({
          data,
          agentName: await this.params.swarm.getAgentName(),
          clientId: this.params.clientId,
        })
    );
    this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "connect",
      source: "session-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return async (incoming: IIncomingMessage): Promise<string> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} connect call`
        );
      const data = await this.execute(incoming.data, "user");
      if (!data) {
        return "";
      }
      await connector({
        data,
        agentName: await this.params.swarm.getAgentName(),
        clientId: incoming.clientId,
      });
      return data;
    };
  }

  /**
   * Disposes of the session, performing cleanup and invoking the onDispose callback if provided.
   * Should be called when the session is no longer needed.
   * @returns {Promise<void>}
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} dispose`
      );
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.swarmName);
  }
}

export default ClientSession;
