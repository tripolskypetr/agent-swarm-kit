import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  OutlineName,
  IOutlineSchema,
} from "../../../interfaces/Outline.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import CompletionSchemaService from "../schema/CompletionSchemaService";
import CompletionValidationService from "./CompletionValidationService";

/**
 * A service class for managing and validating outline schemas in the agent swarm system.
 * Provides methods to register and validate outline schemas, ensuring they are unique and exist before validation.
 * Uses dependency injection to access the logger service and memoization for efficient validation checks.
 * @class OutlineValidationService
*/
export class OutlineValidationService {
  /**
   * The logger service instance for logging outline-related operations and errors.
   * Injected via dependency injection using the TYPES.loggerService identifier.
   * @private
  */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Completion schema service instance for managing completion schemas.
   * Injected via DI, used in validate method to check outline completions.
   * Provides a registry of completion schemas for the swarm.
   * @private
  */
  private readonly completionSchemaService = inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  );

  /**
   * Completion validation service instance for validating completion configurations of outlines.
   * Injected via DI, used in validate method to check outline completion.
   * @private
   * @readonly
  */
  private readonly completionValidationService =
    inject<CompletionValidationService>(TYPES.completionValidationService);

  /**
   * A map storing outline schemas, keyed by their unique outline names.
   * Used to manage registered outlines and retrieve them for validation.
   * @private
  */
  private _outlineMap = new Map<OutlineName, IOutlineSchema>();

  /**
   * Registers a new outline schema with the given name.
   * Logs the addition if info logging is enabled and throws an error if the outline name already exists.
   * @throws {Error} If an outline with the given name already exists in the map.
  */
  public addOutline = (
    outlineName: OutlineName,
    outlineSchema: IOutlineSchema
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("outlineValidationService addOutline", {
        outlineName,
        outlineSchema,
      });
    if (this._outlineMap.has(outlineName)) {
      throw new Error(`agent-swarm outline ${outlineName} already exist`);
    }
    this._outlineMap.set(outlineName, outlineSchema);
  };

  /**
   * Retrieves a list of all registered outline names.
   * Logs the retrieval operation if info logging is enabled.
  */
  public getOutlineList = (): OutlineName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("outlineValidationService getOutlineList");
    return [...this._outlineMap.keys()];
  };

  /**
   * Validates the existence of an outline schema for the given outline name.
   * Memoized to cache results based on the outline name for performance.
   * Logs the validation attempt if info logging is enabled and throws an error if the outline is not found.
   * @throws {Error} If the outline with the given name is not found in the map.
  */
  public validate = memoize(
    ([outlineName]) => outlineName,
    (outlineName: OutlineName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("outlineValidationService validate", {
          outlineName,
          source,
        });
      const outline = this._outlineMap.get(outlineName);
      if (!outline) {
        throw new Error(
          `agent-swarm outline ${outlineName} not found source=${source}`
        );
      }
      const completionSchema = this.completionSchemaService.get(
        outline.completion
      );
      if (!completionSchema.json) {
        throw new Error(
          `agent-swarm outline ${outlineName} completion schema is not JSON source=${source}`
        );
      }
      this.completionValidationService.validate(outline.completion, source);
      return true as never;
    }
  ) as (outlineName: OutlineName, source: string) => void;
}

/**
 * The default export of the OutlineValidationService class.
*/
export default OutlineValidationService;
