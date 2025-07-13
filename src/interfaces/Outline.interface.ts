/**
 * Generic type representing arbitrary param for outline operations.
 * Used as a flexible placeholder for input param in outline schemas and arguments.
 * @typedef {any} IOutlineParam
 */
export type IOutlineParam = any;

/**
 * Generic type representing arbitrary data param for outline operations.
 * Used as a flexible placeholder for data param in outline schemas and results.
 * @typedef {any} IOutlineData
 */
export type IOutlineData = any;

/**
 * Interface representing the format/schema definition for outline data.
 * Specifies the structure, required fields, and property metadata for outline operations.
 * Used to enforce and document the expected shape of outline data.
 */
export interface IOutlineFormat {
  /**
   * The root type of the outline format (e.g., "object").
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
   * @param {IOutlineArgs<Param>} args - The arguments for the outline attempt, including param and history.
   */
  onAttempt?: (args: IOutlineArgs<Param>) => void;

  /**
   * Optional callback triggered when an outline document is generated.
   * Useful for processing or logging the generated document.
   * @param {IOutlineResult<Data, Param>} result - The result of the outline operation, including validity and data.
   */
  onDocument?: (result: IOutlineResult<Data, Param>) => void;

  /**
   * Optional callback triggered when a document passes validation.
   * Useful for handling successful validation outcomes.
   * @param {IOutlineResult<Data, Param>} result - The result of the outline operation with a valid document.
   */
  onValidDocument?: (result: IOutlineResult<Data, Param>) => void;

  /**
   * Optional callback triggered when a document fails validation.
   * Useful for handling failed validation outcomes or retries.
   * @param {IOutlineResult<Data, Param>} result - The result of the outline operation with an invalid document.
   */
  onInvalidDocument?: (result: IOutlineResult<Data, Param>) => void;
}

/**
 * Interface representing a message in the outline system.
 * Used to structure messages stored in the outline history, typically for user, assistant, or system interactions.
 * @interface IOutlineMessage
 */
export interface IOutlineMessage {
  /**
   * The role of the message sender, either user, assistant, or system.
   * Determines the context or source of the message in the outline history.
   * @type {"user" | "assistant" | "system"}
   */
  role: "user" | "assistant" | "system";

  /**
   * The content of the message.
   * Contains the raw text or param of the message, used in history storage or processing.
   * @type {string}
   */
  content: string;
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
   * @param {...(IOutlineMessage | IOutlineMessage[])} messages - The message(s) to add to the history.
   * @returns {Promise<void>} A promise that resolves when the messages are successfully added.
   */
  push(...messages: (IOutlineMessage | IOutlineMessage[])[]): Promise<void>;

  /**
   * Clears all messages from the outline history.
   * Resets the history to an empty state.
   * @returns {Promise<void>} A promise that resolves when the history is cleared.
   */
  clear(): Promise<void>;

  /**
   * Retrieves all messages in the outline history.
   * @returns {Promise<IOutlineMessage[]>} A promise resolving to an array of messages in the history.
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
   * @type {Param}
   */
  param: Param;

  /**
   * The current attempt number for the outline operation.
   * Tracks the number of retries or iterations, useful for validation or retry logic.
   * @type {number}
   */
  attempt: number;

  /**
   * Format of output taken from outline schema
   */
  format: IOutlineFormat;

  /**
   * The history management API for the outline operation.
   * Provides access to message history for context or logging.
   * @type {IOutlineHistory}
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
   * @type {Data}
   */
  data: Data;
}

/**
 * Type definition for a validation function in the outline system.
 * Validates the data of an outline operation based on input and data arguments.
 * @template Data - The type of the data param, defaults to IOutlineData.
 * @template Param - The type of the input param, defaults to IOutlineParam.
 * @callback IOutlineValidationFn
 * @param {IOutlineValidationArgs<Data, Param>} args - The arguments containing input param, data, and history.
 * @returns {void | Promise<void>} A promise or void indicating the completion of validation.
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
   * @type {IOutlineValidation<Data, Param>}
   */
  validate: IOutlineValidationFn<Data, Param>;

  /**
   * Optional description for documentation purposes.
   * Aids in understanding the purpose or behavior of the validation.
   * @type {string | undefined}
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
   * @type {boolean}
   */
  isValid: boolean;

  /**
   * The unique identifier for the execution instance of the outline operation.
   * Used for tracking or debugging specific runs.
   * @type {string}
   */
  resultId: string;

  /**
   * The history of messages associated with the outline operation.
   * Contains the sequence of user, assistant, or system messages.
   * @type {IOutlineMessage[]}
   */
  history: IOutlineMessage[];

  /**
   * Optional error message if the outline operation or validation fails.
   * Null if no error occurs.
   * @type {string | null | undefined}
   */
  error?: string | null;

  /**
   * The input param used for the outline operation.
   * Reflects the original param provided in the arguments.
   * @type {Param}
   */
  param: Param;

  /**
   * The data param generated by the outline operation.
   * Null if the operation fails or no data is produced.
   * @type {Data | null}
   */
  data: Data | null;

  /**
   * The attempt number for this outline operation.
   * Tracks the retry or iteration count for the operation.
   * @type {number}
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

  /**
   * The prompt or prompt generator for the outline operation.
   * Can be a string, an array of strings, or a function that returns a string, array of strings, or a promise resolving to either.
   * If a function is provided, it receives the outline name and can return a prompt dynamically.
   * Used as the initial instruction or context for the outline process.
   * @type {string | string[] | ((outlineName: OutlineName) => (string | string[] | Promise<string | string[]>))}
   */
  prompt: string | string[] | ((outlineName: OutlineName) => (string | string[] | Promise<string | string[]>));

  /**
   * Optional description for documentation purposes.
   * Aids in understanding the purpose or behavior of the outline.
   * @type {string | undefined}
   */
  docDescription?: string;

  /**
   * The unique name of the outline within the system.
   * Identifies the specific outline configuration.
   * @type {OutlineName}
   */
  outlineName: OutlineName;

  /**
   * Function to generate structured data for the outline operation.
   * Processes input param and history to produce the desired data.
   * @param {IOutlineArgs<Param>} args - The arguments containing input param and history.
   * @returns {Promise<Data>} A promise resolving to the structured data.
   */
  getStructuredOutput(args: IOutlineArgs<Param>): Promise<Data>;

  /**
   * Array of validation functions or configurations to apply to the outline data.
   * Supports both direct validation functions and structured validation configurations.
   * @type {(IOutlineValidation<Data, Param> | IOutlineValidationFn<Data, Param>)[]}
   */
  validations?: (
    | IOutlineValidation<Data, Param>
    | IOutlineValidationFn<Data, Param>
  )[];

  /**
   * The format/schema definition for the outline data.
   * Specifies the expected structure, required fields, and property metadata for validation and documentation.
   * @type {IOutlineFormat}
   */
  format: IOutlineFormat;

  /**
   * Optional maximum number of attempts for the outline operation.
   * Limits the number of retries if validations fail.
   * @type {number | undefined}
   */
  maxAttempts?: number;

  /**
   * Optional set of callbacks for outline lifecycle events.
   * Allows customization of attempt, document, and validation handling.
   * @type {IOutlineCallbacks | undefined}
   */
  callbacks?: IOutlineCallbacks;
}

/**
 * Type representing the unique name of an outline within the system.
 * Used to identify specific outline configurations.
 * @typedef {string} OutlineName
 */
export type OutlineName = string;
