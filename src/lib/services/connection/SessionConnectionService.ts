import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import { TContextService } from "../base/ContextService";
import TYPES from "src/lib/core/types";
import { memoize } from "functools-kit";
import ClientSession from "src/client/ClientSession";
import SwarmConnectionService from "./SwarmConnectionService";
import {
  ISession,
  ReceiveMessageFn,
  SendMessageFn,
} from "src/interfaces/Session.interface";

export class SessionConnectionService implements ISession {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly swarmConnectionService = inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  );

  public getSession = memoize(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    (clientId: string, swarmName: string) =>
      new ClientSession({
        clientId,
        logger: this.loggerService,
        swarm: this.swarmConnectionService.getSwarm(clientId, swarmName),
      })
  );

  public execute = async (content: string): Promise<string> => {
    this.loggerService.log(`sessionConnectionService execute`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).execute(content);
  };

  public connect = (connector: SendMessageFn): ReceiveMessageFn => {
    this.loggerService.log(`sessionConnectionService execute`, {
      context: this.contextService.context,
    });
    return this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).connect(connector);
  };

  public commitToolOutput = async (content: string): Promise<void> => {
    this.loggerService.log(`sessionConnectionService execute`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).commitToolOutput(content);
  };

  public commitSystemMessage = async (message: string): Promise<void> => {
    this.loggerService.log(`sessionConnectionService execute`, {
      context: this.contextService.context,
    });
    return await this.getSession(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).commitSystemMessage(message);
  };

  public dispose = async () => {
    this.loggerService.log(`sessionConnectionService dispose`, {
      context: this.contextService.context,
    });
    this.getSession.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.swarmName}`
    );
  };
}

export default SessionConnectionService;
