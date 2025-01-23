import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { SessionId } from "../../../interfaces/Session.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";

export class SessionValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _sessionMap = new Map<SessionId, SwarmName>();

  public addSession = (clientId: SessionId, swarmName: SwarmName) => {
    this.loggerService.log("sessionValidationService addSession", {
      clientId,
    });
    if (this._sessionMap.has(clientId)) {
      throw new Error(`agent-swarm session clientId=${clientId} already exist`);
    }
    this._sessionMap.set(clientId, swarmName);
  };

  public getSessionList = () => {
    this.loggerService.log("sessionValidationService getSessionList");
    return [...this._sessionMap.keys()];
  };

  public getSwarm = (clientId: SessionId) => {
    this.loggerService.log("sessionValidationService getSwarm", {
      clientId,
    });
    const session = this._sessionMap.get(clientId);
    if (session === undefined) {
      throw new Error(`agent-swarm session clientId=${clientId} not found`);
    }
    return session;
  };

  public removeSession = (clientId: SessionId) => {
    this.loggerService.log("sessionValidationService addSession", {
      clientId,
    });
    this._sessionMap.delete(clientId);
  };
}

export default SessionValidationService;
