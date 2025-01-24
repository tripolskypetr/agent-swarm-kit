import { inject } from "../../core/di";
import { SessionConnectionService } from "../connection/SessionConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { ReceiveMessageFn, SendMessageFn } from "../../../interfaces/Session.interface";

interface ISessionConnectionService extends SessionConnectionService {}

type InternalKeys = keyof {
  getSession: never;
};

type TSessionConnectionService = {
  [key in Exclude<keyof ISessionConnectionService, InternalKeys>]: unknown;
};

export class SessionPublicService implements TSessionConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly sessionConnectionService = inject<SessionConnectionService>(
    TYPES.sessionConnectionService
  );

  public execute = async (content: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("sessionPublicService execute", {
      content,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.execute(content);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  public connect = (connector: SendMessageFn, clientId: string, swarmName: SwarmName): ReceiveMessageFn => {
    this.loggerService.log("sessionPublicService connect", {
      clientId,
      swarmName,
    });
    return ContextService.runInContext(
      () => {
        const receive = this.sessionConnectionService.connect(async (outgoing) => {
          return await ContextService.runInContext(
            async () => {
              return await connector(outgoing);
            },
            {
              clientId,
              swarmName,
              agentName: "",
            }
          );
        });
        return (incoming) => {
          return ContextService.runInContext(() => {
            return receive(incoming);
          },       {
            clientId,
            swarmName,
            agentName: "",
          })
        }
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  public commitToolOutput = async (content: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("sessionPublicService commitToolOutput", {
      content,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitToolOutput(content);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  public commitSystemMessage = async (message: string, clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("sessionPublicService commitSystemMessage", {
      message,
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.commitSystemMessage(message);
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };

  public dispose = async (clientId: string, swarmName: SwarmName) => {
    this.loggerService.log("sessionPublicService dispose", {
      clientId,
      swarmName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.sessionConnectionService.dispose();
      },
      {
        clientId,
        swarmName,
        agentName: "",
      }
    );
  };
}

export default SessionPublicService;
