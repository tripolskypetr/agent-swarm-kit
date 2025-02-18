import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { memoize } from "functools-kit";

/**
 * Service for validating completion names.
 */
export class CompletionValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _completionSet = new Set<CompletionName>();

  /**
   * Adds a new completion name to the set.
   * @param {CompletionName} completionName - The name of the completion to add.
   * @throws Will throw an error if the completion name already exists.
   */
  public addCompletion = (completionName: CompletionName) => {
    this.loggerService.log("completionValidationService addCompletion", {
      completionName,
    });
    if (this._completionSet.has(completionName)) {
      throw new Error(`agent-swarm completion ${completionName} already exist`);
    }
    this._completionSet.add(completionName);
  };

  /**
   * Validates if a completion name exists in the set.
   * @param {CompletionName} completionName - The name of the completion to validate.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the completion name is not found.
   */
  public validate = memoize(
    ([completionName]) => completionName,
    (completionName: CompletionName, source: string) => {
      this.loggerService.log("completionValidationService validate", {
        completionName,
        source,
      });
      if (!this._completionSet.has(completionName)) {
        throw new Error(`agent-swarm completion ${completionName} not found source=${source}`);
      }
      return {} as unknown as void;
    }
  ) as (completionName: CompletionName, source: string) => void;
}

export default CompletionValidationService;
