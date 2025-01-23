import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { CompletionName } from "src/interfaces/Completion.interface";
import { memoize } from "functools-kit";

export class CompletionValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _completionSet = new Set<CompletionName>();

  public addCompletion = (completionName: CompletionName) => {
    this.loggerService.log("completionValidationService addCompletion", {
      completionName,
    });
    if (this._completionSet.has(completionName)) {
      throw new Error(`agent-swarm completion ${completionName} already exist`);
    }
    this._completionSet.add(completionName);
  };

  public validate = memoize(
    ([completionName]) => completionName,
    (completionName: CompletionName) => {
      this.loggerService.log("completionValidationService validate", {
        completionName,
      });
      if (!this._completionSet.has(completionName)) {
        throw new Error(`agent-swarm completion ${completionName} not found`);
      }
    }
  ) as (completionName: CompletionName) => void;
}

export default CompletionValidationService;
