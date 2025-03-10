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
 * ClientSession class implements the ISession interface.
 */
export class ClientSession implements ISession {
  readonly _emitSubject = new Subject<string>();

  /**
   * Constructs a new ClientSession instance.
   * @param {ISessionParams} params - The session parameters.
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
   * Emits a message.
   * @param {string} message - The message to emit.
   * @returns {Promise<void>}
   */
  async emit(message: string) {
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
   * Executes a message and optionally emits the output.
   * @param {string} message - The message to execute.
   * @param {boolean} [noEmit=false] - Whether to emit the output or not.
   * @returns {Promise<string>} - The output of the execution.
   */
  async execute(message: string, mode: ExecutionMode) {
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
   * Run the completion stateless
   * @param {string} message - The message to run.
   * @returns {Promise<string>} - The output of the execution.
   */
  async run(message: string) {
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
   * Commits tool output.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param {string} content - The content to commit.
   * @returns {Promise<void>}
   */
  async commitToolOutput(toolId: string, content: string) {
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
   * Commits user message without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  async commitUserMessage(message: string) {
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
   * Commits flush of agent history
   * @returns {Promise<void>}
   */
  async commitFlush() {
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
   * Commits stop of the nexttool execution
   * @returns {Promise<void>}
   */
  async commitStopTools() {
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
   * Commits a system message.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  async commitSystemMessage(message: string) {
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
   * Commits an assistant message.
   * @param {string} message - The assistant message to commit.
   * @returns {Promise<void>}
   */
  async commitAssistantMessage(message: string) {
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
   * Connects the session to a connector function.
   * @param {SendMessageFn} connector - The connector function.
   * @returns {ReceiveMessageFn<string>} - The function to receive messages.
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
    return async (incoming: IIncomingMessage) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientSession clientId=${this.params.clientId} connect call`
        );
      const data = await this.execute(incoming.data, "user");
      if (!data) {
        return;
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
   * Should call on session dispose
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
