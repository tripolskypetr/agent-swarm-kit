import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { CompletionName } from "src/interfaces/Completion.interface";

export class CompletionSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _completionSet = new Set<CompletionName>();

    addCompletion = (completionName: CompletionName) => {
        this.loggerService.log("completionSchemaService addCompletion", {
            completionName,
        });
        if (this._completionSet.has(completionName)) {
            throw new Error(`agent-swarm completion ${completionName} already exist`);
        }
        this._completionSet.add(completionName);
    };

}

export default CompletionSchemaService;
