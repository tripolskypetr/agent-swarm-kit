import { Subject } from "functools-kit";
import { IIncomingMessage } from "../model/EmitMessage.model";

import {
  ExecutionMode,
  ISessionParams,
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { ISession } from "../interfaces/Session.interface";
import { IBusEvent } from "../model/Event.model";

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
  emit = async (message: string) => {
    this.params.logger.debug(
      `ClientSession clientId=${this.params.clientId} emit`,
      {
        message,
      }
    );
    this.params.onEmit &&
      this.params.onEmit(this.params.clientId, this.params.swarmName, message);
    await this._emitSubject.next(message);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "emit",
      source: "session-bus",
      input: {
        message
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  };

  /**
   * Executes a message and optionally emits the output.
   * @param {string} message - The message to execute.
   * @param {boolean} [noEmit=false] - Whether to emit the output or not.
   * @returns {Promise<string>} - The output of the execution.
   */
  execute = async (message: string, mode: ExecutionMode) => {
    this.params.logger.debug(
      `ClientSession clientId=${this.params.clientId} execute`,
      {
        message,
        mode,
      }
    );
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
  };

  /**
   * Commits tool output.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param {string} content - The content to commit.
   * @returns {Promise<void>}
   */
  commitToolOutput = async (toolId: string, content: string) => {
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
  };

  /**
   * Commits user message without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  commitUserMessage = async (message: string) => {
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
  };

  /**
   * Commits flush of agent history
   * @returns {Promise<void>}
   */
  commitFlush = async () => {
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
  };

  /**
   * Commits a system message.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  commitSystemMessage = async (message: string) => {
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
        message
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result
  };

  /**
   * Connects the session to a connector function.
   * @param {SendMessageFn} connector - The connector function.
   * @returns {ReceiveMessageFn} - The function to receive messages.
   */
  connect = (connector: SendMessageFn): ReceiveMessageFn => {
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
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} connect call`
      );
      await connector({
        data: await this.execute(incoming.data, "user"),
        agentName: await this.params.swarm.getAgentName(),
        clientId: incoming.clientId,
      });
    };
  };

  /**
   * Should call on session dispose
   * @returns {Promise<void>}
   */
  dispose = async (): Promise<void> => {
    this.params.logger.debug(
      `ClientSession clientId=${this.params.clientId} dispose`
    );
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.swarmName);
  };
}

export default ClientSession;
