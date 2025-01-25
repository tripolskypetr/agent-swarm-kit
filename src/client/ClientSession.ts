import { Subject } from "functools-kit";
import { IIncomingMessage } from "../model/EmitMessage.model";

import {
  ISessionParams,
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { ISession } from "../interfaces/Session.interface";

export class ClientSession implements ISession {

  readonly _emitSubject = new Subject<string>();

  constructor(readonly params: ISessionParams) {
    this.params.logger.debug(`ClientSession clientId=${this.params.clientId} CTOR`, {
      params,
    })
  }

  execute = async (message: string, noEmit = false) => {
    this.params.logger.debug(`ClientSession clientId=${this.params.clientId} execute`, {
      message,
      noEmit,
    });
    const agent = await this.params.swarm.getAgent();
    const outputAwaiter = this.params.swarm.waitForOutput();
    agent.execute(message);
    const output = await outputAwaiter;
    !noEmit && (await this._emitSubject.next(output));
    return output;
  }

  commitToolOutput = async (content: string) => {
    this.params.logger.debug(`ClientSession clientId=${this.params.clientId} commitToolOutput`, {
      content,
    });
    const agent = await this.params.swarm.getAgent();
    return await agent.commitToolOutput(content);
  };

  commitSystemMessage = async (message: string) => {
    this.params.logger.debug(`ClientSession clientId=${this.params.clientId} commitSystemMessage`, {
      message,
    });
    const agent = await this.params.swarm.getAgent();
    return await agent.commitSystemMessage(message);
  };

  connect = (connector: SendMessageFn): ReceiveMessageFn => {
    this.params.logger.debug(`ClientSession clientId=${this.params.clientId} connect`);
    this._emitSubject.subscribe(async (data: string) => await connector({
      data,
      agentName: await this.params.swarm.getAgentName(),
      clientId: this.params.clientId,
    }));
    return async (incoming: IIncomingMessage) => {
      this.params.logger.debug(`ClientSession clientId=${this.params.clientId} connect call`);
      await connector({
        data: await this.execute(incoming.data, true),
        agentName: await this.params.swarm.getAgentName(),
        clientId: incoming.clientId,
      });
    };
  };
}

export default ClientSession;
