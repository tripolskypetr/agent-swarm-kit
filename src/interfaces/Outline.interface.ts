/**
 * Generic type representing arbitrary data for outline operations.
 * Used as a flexible placeholder for input data in outline schemas and arguments.
 * @typedef {any} IOutlineData
 */
export type IOutlineData = any;

/**
 * Generic type representing arbitrary output data for outline operations.
 * Used as a flexible placeholder for output data in outline schemas and results.
 * @typedef {any} IOutlineOutput
 */
export type IOutlineOutput = any;

/**
 * Interface defining callbacks for outline lifecycle events.
 * Provides hooks for handling attempt initiation, document generation, and validation outcomes.
 * @template Output - The type of the output data, defaults to IOutlineOutput.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @interface IOutlineCallbacks
 */
export interface IOutlineCallbacks<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  /**
   * Optional callback triggered when an outline attempt is initiated.
   * Useful for logging or tracking attempt starts.
   * @param {IOutlineArgs<Data>} args - The arguments for the outline attempt, including data and history.
   */
  onAttempt?: (args: IOutlineArgs<Data>) => void;

  /**
   * Optional callback triggered when an outline document is generated.
   * Useful for processing or logging the generated document.
   * @param {IOutlineResult<Output, Data>} result - The result of the outline operation, including validity and output.
   */
  onDocument?: (result: IOutlineResult<Output, Data>) => void;

  /**
   * Optional callback triggered when a document passes validation.
   * Useful for handling successful validation outcomes.
   * @param {IOutlineResult<Output, Data>} result - The result of the outline operation with a valid document.
   */
  onValidDocument?: (result: IOutlineResult<Output, Data>) => void;

  /**
   * Optional callback triggered when a document fails validation.
   * Useful for handling failed validation outcomes or retries.
   * @param {IOutlineResult<Output, Data>} result - The result of the outline operation with an invalid document.
   */
  onInvalidDocument?: (result: IOutlineResult<Output, Data>) => void;
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
   * Contains the raw text or data of the message, used in history storage or processing.
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
 * Encapsulates the input data, attempt number, and history for processing.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @interface IOutlineArgs
 */
export interface IOutlineArgs<Data extends IOutlineData = IOutlineData> {
  /**
   * The input data for the outline operation.
   * Contains the raw or structured data to be processed.
   * @type {Data}
   */
  data: Data;

  /**
   * The current attempt number for the outline operation.
   * Tracks the number of retries or iterations, useful for validation or retry logic.
   * @type {number}
   */
  attempt: number;

  /**
   * The history management API for the outline operation.
   * Provides access to message history for context or logging.
   * @type {IOutlineHistory}
   */
  history: IOutlineHistory;
}

/**
 * Interface extending outline arguments with output data for validation.
 * Used to pass both input and output data to validation functions.
 * @template Output - The type of the output data, defaults to IOutlineOutput.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @interface IOutlineValidationArgs
 * @extends {IOutlineArgs<Data>}
 */
export interface IOutlineValidationArgs<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> extends IOutlineArgs<Data> {
  /**
   * The output data generated by the outline operation.
   * Contains the result to be validated, typically structured data.
   * @type {Output}
   */
  output: Output;
}

/**
 * Type definition for a validation function in the outline system.
 * Validates the output of an outline operation based on input and output arguments.
 * @template Output - The type of the output data, defaults to IOutlineOutput.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @callback IOutlineValidationFn
 * @param {IOutlineValidationArgs<Output, Data>} args - The arguments containing input data, output, and history.
 * @returns {void | Promise<void>} A promise or void indicating the completion of validation.
 */
export interface IOutlineValidationFn<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  (args: IOutlineValidationArgs<Output, Data>): void | Promise<void>;
}

/**
 * Interface representing a validation configuration for outline operations.
 * Defines the validation logic and optional documentation for a specific validator.
 * @template Output - The type of the output data, defaults to IOutlineOutput.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @interface IOutlineValidation
 */
export interface IOutlineValidation<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  /**
   * The validation function or configuration to apply to the outline output.
   * Can reference itself or another validation for chained or reusable logic.
   * @type {IOutlineValidation<Output, Data>}
   */
  validate: IOutlineValidationFn<Output, Data>;

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
 * @template Output - The type of the output data, defaults to IOutlineOutput.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @interface IOutlineResult
 */
export interface IOutlineResult<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  /**
   * Indicates whether the outline output is valid based on validation checks.
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
   * The input data used for the outline operation.
   * Reflects the original data provided in the arguments.
   * @type {Data}
   */
  data: Data;

  /**
   * The output data generated by the outline operation.
   * Null if the operation fails or no output is produced.
   * @type {Output | null}
   */
  output: Output | null;

  /**
   * The attempt number for this outline operation.
   * Tracks the retry or iteration count for the operation.
   * @type {number}
   */
  attempt: number;
}

/**
 * Interface representing the schema for configuring an outline operation.
 * Defines the structure and behavior of an outline, including output generation and validation.
 * @template Output - The type of the output data, defaults to IOutlineOutput.
 * @template Data - The type of the input data, defaults to IOutlineData.
 * @interface IOutlineSchema
 */
export interface IOutlineSchema<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
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
   * Function to generate structured output for the outline operation.
   * Processes input data and history to produce the desired output.
   * @param {IOutlineArgs<Data>} args - The arguments containing input data and history.
   * @returns {Promise<Output>} A promise resolving to the structured output.
   */
  getStructuredOutput(args: IOutlineArgs<Data>): Promise<Output>;

  /**
   * Array of validation functions or configurations to apply to the outline output.
   * Supports both direct validation functions and structured validation configurations.
   * @type {(IOutlineValidation<Output, Data> | IOutlineValidationFn<Output, Data>)[]}
   */
  validations?: (
    | IOutlineValidation<Output, Data>
    | IOutlineValidationFn<Output, Data>
  )[];

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
