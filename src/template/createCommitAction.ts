import { GLOBAL_CONFIG } from "../config/params";
import { commitToolOutput } from "../functions/commit/commitToolOutput";
import { commitToolOutputForce } from "../functions/commit/commitToolOutputForce";
import { execute } from "../functions/target/execute";
import { executeForce } from "../functions/target/executeForce";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName } from "../interfaces/Agent.interface";

const METHOD_NAME = "function.template.commitAction";

/**
 * Represents validation errors for action parameters.
 * Maps parameter names to their error messages.
 */
export type ValidationErrors = Record<string, string>;

/**
 * Result of parameter validation.
 */
export interface IValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation error messages if any */
  errors?: ValidationErrors;
}

/**
 * Configuration parameters for creating a commit action handler.
 * Defines validation, action execution, and response messages.
 *
 * @template T - The type of parameters expected by the action
 * @interface ICommitActionParams
 * @property {(params: T, clientId: string, agentName: AgentName) => IValidationResult | Promise<IValidationResult>} [validateParams] - Optional function to validate action parameters. Returns validation result with errors if validation fails.
 * @property {(params: T, clientId: string, agentName: AgentName) => void | Promise<void>} executeAction - Function to execute the actual action (e.g., commitAppAction). Called only when parameters are valid and isLast is true.
 * @property {string | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>)} successMessage - Message or function to return on successful action execution.
 * @property {string | ((errors: ValidationErrors, clientId: string, agentName: AgentName) => string | Promise<string>)} [validationErrorMessage] - Optional message or function to return when validation fails. Receives validation errors.
 * @property {string} [continueMessage] - Optional message to return when isLast is false. Defaults to "Continue conversation based on chat history if it exists".
 * @property {string | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>)} [followUpMessage] - Optional message to execute after successful action (only if provided).
 * @property {boolean} [useForceExecute] - Whether to use executeForce instead of execute for follow-up message. Defaults to false.
 *
 * @example
 * // Create a payment action handler with validation
 * const paymentAction = createCommitAction({
 *   validateParams: async (params) => {
 *     const errors: ValidationErrors = {};
 *     if (!params.bank_name) errors.bank_name = "Bank name is required";
 *     if (!params.amount) errors.amount = "Amount is required";
 *     return { isValid: Object.keys(errors).length === 0, errors };
 *   },
 *   executeAction: async (params, clientId) => {
 *     await commitAppAction(clientId, "credit-payment", params);
 *   },
 *   successMessage: "Page successfully opened, you can now make payment",
 *   followUpMessage: "what is this page about",
 *   validationErrorMessage: (errors) => {
 *     return Object.entries(errors).map(([key, msg]) => `${key}: ${msg}`).join("\n");
 *   }
 * });
 */
export interface ICommitActionParams<T = Record<string, any>> {
  /**
   * Optional function to validate action parameters.
   * Should return validation result with errors if validation fails.
   */
  validateParams?: (
    params: T,
    clientId: string,
    agentName: AgentName
  ) => IValidationResult | Promise<IValidationResult>;

  /**
   * Function to execute the actual action (e.g., commitAppAction).
   * Called only when parameters are valid and isLast is true.
   */
  executeAction: (
    params: T,
    clientId: string,
    agentName: AgentName
  ) => void | Promise<void>;

  /**
   * Message or function to return on successful action execution.
   */
  successMessage:
    | string
    | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>);

  /**
   * Optional message or function to return when validation fails.
   * Receives validation errors for custom formatting.
   */
  validationErrorMessage?:
    | string
    | ((
        errors: ValidationErrors,
        params: T,
        clientId: string,
        agentName: AgentName
      ) => string | Promise<string>);

  /**
   * Optional message to return when isLast is false.
   * Defaults to "Continue conversation based on chat history if it exists".
   */
  continueMessage?: string;

  /**
   * Optional message to execute after successful action.
   * If provided, will call execute() or executeForce() with this message.
   */
  followUpMessage?:
    | string
    | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>);

  /**
   * Whether to use executeForce instead of execute for follow-up message.
   * Defaults to false.
   */
  useForceExecute?: boolean;
}

/**
 * Default validation error message formatter.
 */
const DEFAULT_VALIDATION_ERROR_MESSAGE = (
  errors: ValidationErrors,
  _params: any,
  _clientId: string,
  _agentName: AgentName
) => {
  return Object.entries(errors)
    .map(([param, message]) => `${param}: ${message}`)
    .join("\n");
};

/**
 * Default continue message when isLast is false.
 */
const DEFAULT_CONTINUE_MESSAGE =
  "Continue conversation based on chat history if it exists";

/**
 * Creates a function to validate parameters, execute an action, and commit appropriate responses.
 * The factory generates a handler that validates parameters, executes the action if valid,
 * commits tool outputs, and optionally triggers follow-up execution.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @throws {Error} If validation, action execution, commit, or execution operations fail.
 *
 * @example
 * // Create a payment action handler
 * const handlePayment = createCommitAction({
 *   validateParams: async (params) => {
 *     if (!params.amount) return { isValid: false, errors: { amount: "Required" } };
 *     return { isValid: true };
 *   },
 *   executeAction: async (params, clientId) => {
 *     await commitAppAction(clientId, "payment", params);
 *   },
 *   successMessage: "Payment processed successfully",
 *   followUpMessage: "Check your balance",
 * });
 * await handlePayment("tool-123", "client-456", "PaymentAgent", { amount: 100 }, true);
 */
export const createCommitAction = <T = Record<string, any>>({
  validateParams,
  executeAction,
  successMessage,
  validationErrorMessage = DEFAULT_VALIDATION_ERROR_MESSAGE,
  continueMessage = DEFAULT_CONTINUE_MESSAGE,
  followUpMessage,
  useForceExecute = false,
}: ICommitActionParams<T>) => {
  /**
   * Validates parameters, executes action, and commits appropriate responses.
   *
   * @throws {Error} If validation, action execution, commit, or execution operations fail.
   */
  return beginContext(
    async (
      toolId: string,
      clientId: string,
      agentName: AgentName,
      params: T,
      isLast: boolean
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
          agentName,
          params,
          isLast,
        });

      // Handle non-last tool calls
      if (!isLast) {
        await commitToolOutputForce(toolId, continueMessage, clientId);
        return;
      }

      // Validate parameters if validation function is provided
      if (validateParams) {
        const validationResult = await validateParams(params, clientId, agentName);

        if (!validationResult.isValid && validationResult.errors) {
          const errorMessage =
            typeof validationErrorMessage === "string"
              ? validationErrorMessage
              : await validationErrorMessage(
                  validationResult.errors,
                  params,
                  clientId,
                  agentName
                );

          await commitToolOutput(toolId, errorMessage, clientId, agentName);
          return;
        }
      }

      // Execute the action
      await executeAction(params, clientId, agentName);

      // Commit success message
      const message =
        typeof successMessage === "string"
          ? successMessage
          : await successMessage(params, clientId, agentName);

      await commitToolOutput(toolId, message, clientId, agentName);

      // Execute follow-up message if provided
      if (followUpMessage) {
        const followUp =
          typeof followUpMessage === "string"
            ? followUpMessage
            : await followUpMessage(params, clientId, agentName);

        if (useForceExecute) {
          await executeForce(followUp, clientId);
        } else {
          await execute(followUp, clientId, agentName);
        }
      }
    }
  );
};
