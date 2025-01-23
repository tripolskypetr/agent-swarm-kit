import { IIncomingMessage } from "../model/EmitMessage.model";

import {
  ISessionParams,
  ReceiveMessageFn,
  SendMessageFn,
} from "../interfaces/Session.interface";
import { ISession } from "../interfaces/Session.interface";

export class ClientSession implements ISession {
  constructor(readonly params: ISessionParams) {
  }

  execute = async (message: string) => {
    this.params.logger.debug("BaseSession execute", {
      message,
    });
    const agent = await this.params.swarm.getAgent();
    const output = this.params.swarm.waitForOutput();
    agent.execute(message);
    return await output;
  };

  commitToolOutput = async (content: string) => {
    this.params.logger.debug("BaseSession commitToolOutput", {
      content,
    });
    const agent = await this.params.swarm.getAgent();
    return await agent.commitToolOutput(content);
  };

  commitSystemMessage = async (message: string) => {
    this.params.logger.debug("BaseSession commitSystemMessage", {
      message,
    });
    const agent = await this.params.swarm.getAgent();
    return await agent.commitSystemMessage(message);
  };

  connect = (connector: SendMessageFn): ReceiveMessageFn => {
    this.params.logger.debug("BaseSession connect");
    return async (incoming: IIncomingMessage) => {
      this.params.logger.debug("BaseSession connect call");
      await connector({
        data: await this.execute(incoming.data),
        agentName: await this.params.swarm.getAgentName(),
        clientId: incoming.clientId,
      });
    };
  };
}

export default ClientSession;
