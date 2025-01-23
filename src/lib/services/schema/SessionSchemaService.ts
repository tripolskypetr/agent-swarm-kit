import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { CompletionName } from "src/interfaces/Completion.interface";

export class SessionSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _sessionSet = new Set<CompletionName>();

    addSession = (clientId: string) => {
        this.loggerService.log("sessionSchemaService addSession", {
            clientId,
        });
        if (this._sessionSet.has(clientId)) {
            throw new Error(`agent-swarm session clientId=${clientId} already exist`);
        }
        this._sessionSet.add(clientId);
    };

}

export default SessionSchemaService;
