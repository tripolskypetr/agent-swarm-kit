import { GLOBAL_CONFIG } from "../config/params";
import { commitToolOutput } from "../functions/commit/commitToolOutput";
import { executeForce } from "../functions/target/executeForce";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName, ToolName } from "../interfaces/Agent.interface";
import { getAgentName } from "../functions/common/getAgentName";
import { IToolCall } from "../model/Tool.model";
import { CATCH_SYMBOL, getErrorMessage, trycatch } from "functools-kit";

const METHOD_NAME = "function.template.commitAction";

/**
 * Configuration parameters for creating a commit action handler (WRITE pattern).
 * Defines validation, action execution, and response messages for state-modifying operations.
 *
 * @template T - The type of parameters expected by the action
 * @interface ICommitActionParams
 *
 * @property {function} [fallback] - Optional error handler for executeAction failures
 *   - @param {Error} error - The error object thrown during execution
 *   - @param {string} clientId - The client identifier
 *   - @param {AgentName} agentName - The name of the current agent
 *   - Called when executeAction throws an exception
 *   - Error message is automatically committed as tool output and failureMessage is executed
 *
 * @property {function} [validateParams] - Optional function to validate action parameters
 *   - @param {object} dto - Validation context object
 *   - @param {string} dto.clientId - The client identifier
 *   - @param {AgentName} dto.agentName - The name of the current agent
 *   - @param {IToolCall[]} dto.toolCalls - Array of tool calls in current execution
 *   - @param {T} dto.params - Tool call parameters
 *   - @returns {string | null | Promise<string | null>} Error message if validation fails, null if valid
 *
 * @property {function} executeAction - Function to execute the actual action (e.g., commitAppAction)
 *   - @param {T} params - Tool call parameters (validated if validateParams was provided)
 *   - @param {string} clientId - The client identifier
 *   - @param {AgentName} agentName - The name of the current agent
 *   - @returns {string | Promise<string>} Result string to commit as tool output (empty string if action produced no result)
 *
 * @property {function} [emptyContent] - Optional function to handle when executeAction returns empty result
 *   - @param {T} params - Tool call parameters
 *   - @param {string} clientId - The client identifier
 *   - @param {AgentName} agentName - The name of the current agent
 *   - @returns {string | Promise<string>} Message to commit as tool output
 *   - @default "Action executed but produced no result"
 *
 * @property {string | function} successMessage - Message to execute using executeForce after successful action
 *   - Can be static string or function that returns string
 *   - If function: receives (params, clientId, agentName) as arguments
 *
 * @property {string | function} [failureMessage] - Optional message to execute using executeForce when validation fails
 *   - Can be static string or function that returns string
 *   - If function: receives (params, clientId, agentName) as arguments
 *   - If not provided: uses the validation error message instead
 *
 * @example
 * // Payment action with validation and error handling
 * const paymentAction = createCommitAction({
 *   fallback: (error, clientId, agentName) => {
 *     console.error(`Payment action failed for ${clientId} (${agentName}):`, error);
 *   },
 *   validateParams: async ({ params, clientId, agentName, toolCalls }) => {
 *     if (!params.bank_name) return "Bank name is required";
 *     if (!params.amount) return "Amount is required";
 *     return null; // Valid
 *   },
 *   executeAction: async (params, clientId) => {
 *     await commitAppAction(clientId, "credit-payment", params);
 *     return "Payment page opened successfully";
 *   },
 *   successMessage: "what is this page about",
 *   failureMessage: "Could not open payment page",
 * });
 */
export interface ICommitActionParams<T = Record<string, any>> {
  /**
   * Optional function to handle errors during action execution.
   * Receives the error object, client ID, and agent name.
   */
  fallback?: (error: Error, clientId: string, agentName: AgentName) => void;

  /**
   * Optional function to validate action parameters.
   * Returns error message string if validation fails, null if valid.
   */
  validateParams?: (dto: {
    clientId: string;
    agentName: AgentName;
    toolCalls: IToolCall[];
    params: T;
  }) => string | null | Promise<string | null>;

  /**
   * Function to execute the actual action (e.g., commitAppAction).
   * Called only when parameters are valid and isLast is true.
   * Returns result string to commit as tool output.
   */
  executeAction: (
    params: T,
    clientId: string,
    agentName: AgentName
  ) => string | Promise<string>;

  /**
   * Optional function to handle when executeAction returns empty result.
   * Returns message to commit as tool output.
   */
  emptyContent?: (
    params: T,
    clientId: string,
    agentName: AgentName
  ) => string | Promise<string>;

  /**
   * Message to execute using executeForce after successful action execution.
   */
  successMessage:
    | string
    | ((
        params: T,
        clientId: string,
        agentName: AgentName
      ) => string | Promise<string>);

  /**
   * Optional message to execute using executeForce when validation fails.
   */
  failureMessage?:
    | string
    | ((
        params: T,
        clientId: string,
        agentName: AgentName
      ) => string | Promise<string>);
}

/**
 * Creates a commit action handler that executes actions and modifies system state (WRITE pattern).
 *
 * **Execution flow:**
 * 1. Checks if agent hasn't changed during execution
 * 2. If validateParams provided: validates parameters
 *    - If invalid: commits error message → executes failureMessage (or error message) → stops
 * 3. Calls executeAction to perform the action (wrapped in trycatch)
 *    - If executeAction throws: calls fallback handler (if provided) → commits error message → executes failureMessage → stops
 * 4. Commits action result (or emptyContent if result is empty)
 * 5. Executes successMessage via executeForce
 *
 * @template T - The type of parameters expected by the action
 * @param {ICommitActionParams<T>} config - Configuration object
 * @returns {function} Handler function that executes the action with validation
 *
 * @throws {Error} If validation, action execution, commit, or execution operations fail
 *
 * @example
 * // Create payment handler with error handling
 * const handlePayment = createCommitAction({
 *   fallback: (error, clientId, agentName) => {
 *     logger.error("Payment execution failed", { error, clientId, agentName });
 *   },
 *   validateParams: async ({ params, clientId, agentName, toolCalls }) => {
 *     if (!params.amount) return "Amount is required";
 *     return null;
 *   },
 *   executeAction: async (params, clientId) => {
 *     await commitAppAction(clientId, "payment", params);
 *     return "Payment processed successfully";
 *   },
 *   emptyContent: () => "Payment failed - no result",
 *   successMessage: "Check your balance",
 *   failureMessage: "Payment validation failed",
 * });
 * // Usage: called internally by addCommitAction
 * await handlePayment("tool-123", "client-456", "PaymentAgent", "pay", { amount: 100 }, [], true);
 */
export const createCommitAction = <T = Record<string, any>>({
  validateParams,
  executeAction,
  emptyContent,
  fallback,
  successMessage,
  failureMessage,
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
      toolName: ToolName,
      params: T,
      toolCalls: IToolCall[],
      isLast: boolean
    ) => {
      let executeMessage = "";

      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
          agentName,
          params,
          isLast,
        });

      const currentAgentName = await getAgentName(clientId);
      if (currentAgentName !== agentName) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
          swarm.loggerService.log(`${toolName} skipped due to agent change`, {
            currentAgentName,
            agentName,
            clientId,
          });
        if (isLast) {
          await executeForce(executeMessage, clientId);
        }
        return;
      }

      // Validate parameters if validation function is provided
      if (validateParams) {
        const errorMessage = await validateParams({
          params,
          clientId,
          agentName,
          toolCalls,
        });

        if (errorMessage) {
          await commitToolOutput(toolId, errorMessage, clientId, agentName);

          // Execute failure message if provided
          if (failureMessage) {
            executeMessage =
              typeof failureMessage === "string"
                ? failureMessage
                : await failureMessage(params, clientId, agentName);
          }

          if (!failureMessage) {
            executeMessage = errorMessage;
          }

          if (isLast) {
            await executeForce(executeMessage, clientId);
          }
          return;
        }
      }

      let error: Error;

      const runner = trycatch(executeAction, {
        fallback: (e) => {
          error = e;
          fallback && fallback(e, clientId, agentName);
        },
      });

      // Execute the action and get result
      const actionResult = await runner(params, clientId, agentName);

      // Commit action result as tool output
      if (actionResult === CATCH_SYMBOL) {

        const errorMessage = getErrorMessage(error);

        await commitToolOutput(toolId, errorMessage, clientId, agentName);

        // Execute failure message if provided
        if (failureMessage) {
          executeMessage =
            typeof failureMessage === "string"
              ? failureMessage
              : await failureMessage(params, clientId, agentName);
        }

        if (!failureMessage) {
          executeMessage = errorMessage;
        }

        if (isLast) {
          await executeForce(executeMessage, clientId);
        }
        return;
      } else if (actionResult) {
        await commitToolOutput(toolId, actionResult, clientId, agentName);
      } else {
        const message = emptyContent
          ? await emptyContent(params, clientId, agentName)
          : "Action executed but produced no result";
        await commitToolOutput(toolId, message, clientId, agentName);
      }

      // Prepare success message
      executeMessage =
        typeof successMessage === "string"
          ? successMessage
          : await successMessage(params, clientId, agentName);

      if (isLast) {
        await executeForce(executeMessage, clientId);
      }
    }
  );
};
