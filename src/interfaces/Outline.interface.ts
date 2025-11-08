import { CompletionName } from "./Completion.interface";
import { IOutlineMessage } from "../contract/OutlineMessage.contract";

/**
 * Generic type representing arbitrary param for outline operations.
 * Used as a flexible placeholder for input param in outline schemas and arguments.
*/
export type IOutlineParam = any;

/**
 * Generic type representing arbitrary data param for outline operations.
 * Used as a flexible placeholder for data param in outline schemas and results.
*/
export type IOutlineData = any;

/**
 * Type representing the format definition for outline data.
 * Can be either a full JSON schema format or an object-based format.
 * Used to specify the expected structure for outline operations.
*/
export type IOutlineFormat = IOutlineSchemaFormat | IOutlineObjectFormat;

/**
 * Interface representing a format definition using a JSON schema.
 * Specifies the type and the associated JSON schema object for validation.
 * Used when the outline format is defined by a complete JSON schema.
*/
export interface IOutlineSchemaFormat {
  /**
   * The type of the outline format (e.g., "json_schema").
   */
  type: string;

  /**
   * The JSON schema object defining the structure and validation rules.
   */
  json_schema: object;
}

/**
 * Interface representing the format/schema definition for outline data.
 * Specifies the structure, required fields, and property metadata for outline operations.
 * Used to enforce and document the expected shape of outline data.
*/
export interface IOutlineObjectFormat {
  /**
   * The root type of the outline format (e.g., "object").
   * If openai used Should be "json_object" for partial JSON schemas or "json_schema" for full matching schemas.
   * If ollama or `toJsonSchema` function used should just pass "object"
   */
  type: string;

  /**
   * Array of property names that are required in the outline data.
   */
  required: string[];

  /**
   * An object mapping property names to their type, description, and optional enum values.
   * Each property describes a field in the outline data.
   */
  properties: {
    [key: string]: {
      /**
       * The type of the property (e.g., "string", "number", "boolean", etc.).
      */
      type: string;

      /**
       * A human-readable description of the property.
      */
      description: string;

      /**
       * Optional array of allowed values for the property.
      */
      enum?: string[];
    };
  };
}

/**
 * Interface defining callbacks for outline lifecycle events.
 * Provides hooks for handling attempt initiation, document generation, and validation outcomes.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @interface IOutlineCallbacks
*/
export interface IOutlineCallbacks<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> {
  /**
   * Optional callback triggered when an outline attempt is initiated.
   * Useful for logging or tracking attempt starts.
   */
  onAttempt?: (args: IOutlineArgs<Param>) => void;

  /**
   * Optional callback triggered when an outline document is generated.
   * Useful for processing or logging the generated document.
   */
  onDocument?: (result: IOutlineResult<Data, Param>) => void;

  /**
   * Optional callback triggered when a document passes validation.
   * Useful for handling successful validation outcomes.
   */
  onValidDocument?: (result: IOutlineResult<Data, Param>) => void;

  /**
   * Optional callback triggered when a document fails validation.
   * Useful for handling failed validation outcomes or retries.
   */
  onInvalidDocument?: (result: IOutlineResult<Data, Param>) => void;
}

/**
 * Interface representing the history management API for outline operations.
 * Provides methods to manage message history, such as adding, clearing, and listing messages.
 * @interface IOutlineHistory
*/
export interface IOutlineHistory {
  /**
   * Adds one or more messages to the outline history.
   * Supports both single messages and arrays of messages for flexibility.
   */
  push(...messages: (IOutlineMessage | IOutlineMessage[])[]): Promise<void>;

  /**
   * Clears all messages from the outline history.
   * Resets the history to an empty state.
   */
  clear(): Promise<void>;

  /**
   * Retrieves all messages in the outline history.
   */
  list(): Promise<IOutlineMessage[]>;
}

/**
 * Interface representing the arguments for an outline operation.
 * Encapsulates the input param, attempt number, and history for processing.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @interface IOutlineArgs
*/
export interface IOutlineArgs<Param extends IOutlineParam = IOutlineParam> {
  /**
   * The input param for the outline operation.
   * Contains the raw or structured param to be processed.
   */
  param: Param;

  /**
   * The current attempt number for the outline operation.
   * Tracks the number of retries or iterations, useful for validation or retry logic.
   */
  attempt: number;

  /**
   * Format of output taken from outline schema
   */
  format: IOutlineFormat;

  /**
   * The history management API for the outline operation.
   * Provides access to message history for context or logging.
   */
  history: IOutlineHistory;
}

/**
 * Interface extending outline arguments with data param for validation.
 * Used to pass both input and data param to validation functions.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @interface IOutlineValidationArgs
 * @extends {IOutlineArgs<Param>}
*/
export interface IOutlineValidationArgs<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> extends IOutlineArgs<Param> {
  /**
   * The data param generated by the outline operation.
   * Contains the result to be validated, typically structured param.
   */
  data: Data;
}

/**
 * Type definition for a validation function in the outline system.
 * Validates the data of an outline operation based on input and data arguments.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
*/
export interface IOutlineValidationFn<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> {
  (args: IOutlineValidationArgs<Data, Param>): void | Promise<void>;
}

/**
 * Interface representing a validation configuration for outline operations.
 * Defines the validation logic and optional documentation for a specific validator.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @interface IOutlineValidation
*/
export interface IOutlineValidation<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> {
  /**
   * The validation function or configuration to apply to the outline data.
   * Can reference itself or another validation for chained or reusable logic.
   */
  validate: IOutlineValidationFn<Data, Param>;

  /**
   * Optional description for documentation purposes.
   * Aids in understanding the purpose or behavior of the validation.
   */
  docDescription?: string;
}

/**
 * Interface representing the result of an outline operation.
 * Encapsulates the outcome, including validity, execution details, and history.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @interface IOutlineResult
*/
export interface IOutlineResult<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> {
  /**
   * Indicates whether the outline data is valid based on validation checks.
   * True if all validations pass, false otherwise.
   */
  isValid: boolean;

  /**
   * The unique identifier for the execution instance of the outline operation.
   * Used for tracking or debugging specific runs.
   */
  resultId: string;

  /**
   * The history of messages associated with the outline operation.
   * Contains the sequence of user, assistant, or system messages.
   */
  history: IOutlineMessage[];

  /**
   * Optional error message if the outline operation or validation fails.
   * Null if no error occurs.
   */
  error?: string | null;

  /**
   * The input param used for the outline operation.
   * Reflects the original param provided in the arguments.
   */
  param: Param;

  /**
   * The data param generated by the outline operation.
   * Null if the operation fails or no data is produced.
   */
  data: Data | null;

  /**
   * The attempt number for this outline operation.
   * Tracks the retry or iteration count for the operation.
   */
  attempt: number;
}

/**
 * Interface representing the schema for configuring an outline operation.
 * Defines the structure and behavior of an outline, including data generation and validation.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @interface IOutlineSchema
*/
export interface IOutlineSchema<
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
> {

  /** The name of the completion for JSON*/
  completion: CompletionName;

  /**
   * The prompt used to initiate the outline operation.
   * Can be a static string or a function that generates the prompt dynamically based on the outline name.
   * If a function is provided, it may return a string or a Promise resolving to a string.
   * This prompt is typically sent to the completion engine or model to guide the generation process.
   */
  prompt?: string | ((outlineName: OutlineName) => (string | Promise<string>));

  /**
   * The system prompt(s) provided to the language model for the outline operation.
   * Can be a static array of strings or a function that generates the system prompts dynamically based on the outline name.
   * These prompts are typically used to set context, instructions, or constraints for the model before user or assistant messages.
   */
  system?: string[] | ((outlineName: OutlineName) => (string[] | Promise<string[]>));

  /**
   * Optional description for documentation purposes.
   * Aids in understanding the purpose or behavior of the outline.
   */
  docDescription?: string;

  /**
   * The unique name of the outline within the system.
   * Identifies the specific outline configuration.
   */
  outlineName: OutlineName;

  /**
   * Function to generate structured data for the outline operation.
   * Processes input param and history to produce the desired data.
   */
  getOutlineHistory(args: IOutlineArgs<Param>): Promise<void>;

  /**
   * Array of validation functions or configurations to apply to the outline data.
   * Supports both direct validation functions and structured validation configurations.
   */
  validations?: (
    | IOutlineValidation<Data, Param>
    | IOutlineValidationFn<Data, Param>
  )[];

  /**
   * The format/schema definition for the outline data.
   * Specifies the expected structure, required fields, and property metadata for validation and documentation.
   */
  format: IOutlineFormat;

  /**
   * Optional maximum number of attempts for the outline operation.
   * Limits the number of retries if validations fail.
   */
  maxAttempts?: number;

  /**
   * Optional set of callbacks for outline lifecycle events.
   * Allows customization of attempt, document, and validation handling.
   */
  callbacks?: IOutlineCallbacks;
}

/**
 * Type representing the unique name of an outline within the system.
 * Used to identify and reference specific outline configurations.
*/
export type OutlineName = string;
