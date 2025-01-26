import { Subject } from "functools-kit";
import { IIncomingMessage } from "../model/EmitMessage.model";

import {
  ISessionParams,
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { ISession } from "../interfaces/Session.interface";

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
    await this._emitSubject.next(message);
  };

  /**
   * Executes a message and optionally emits the output.
   * @param {string} message - The message to execute.
   * @param {boolean} [noEmit=false] - Whether to emit the output or not.
   * @returns {Promise<string>} - The output of the execution.
   */
  execute = async (message: string, noEmit = false) => {
    this.params.logger.debug(
      `ClientSession clientId=${this.params.clientId} execute`,
      {
        message,
        noEmit,
      }
    );
    const agent = await this.params.swarm.getAgent();
    const outputAwaiter = this.params.swarm.waitForOutput();
    agent.execute(message);
    const output = await outputAwaiter;
    !noEmit && (await this._emitSubject.next(output));
    return output;
  };

  /**
   * Commits tool output.
   * @param {string} content - The content to commit.
   * @returns {Promise<void>}
   */
  commitToolOutput = async (content: string) => {
    this.params.logger.debug(
      `ClientSession clientId=${this.params.clientId} commitToolOutput`,
      {
        content,
      }
    );
    const agent = await this.params.swarm.getAgent();
    return await agent.commitToolOutput(content);
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
    return await agent.commitUserMessage(message);
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
    return await agent.commitSystemMessage(message);
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
    this._emitSubject.subscribe(
      async (data: string) =>
        await connector({
          data,
          agentName: await this.params.swarm.getAgentName(),
          clientId: this.params.clientId,
        })
    );
    return async (incoming: IIncomingMessage) => {
      this.params.logger.debug(
        `ClientSession clientId=${this.params.clientId} connect call`
      );
      await connector({
        data: await this.execute(incoming.data, true),
        agentName: await this.params.swarm.getAgentName(),
        clientId: incoming.clientId,
      });
    };
  };
}

export default ClientSession;
