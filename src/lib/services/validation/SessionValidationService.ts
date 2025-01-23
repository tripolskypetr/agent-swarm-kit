import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { CompletionName } from "src/interfaces/Completion.interface";
import { SessionId } from "src/interfaces/Session.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";

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

    public removeSession = (clientId: SessionId) => {
        this.loggerService.log("sessionValidationService addSession", {
            clientId,
        });
        this._sessionMap.delete(clientId);
    };

}

export default SessionValidationService;