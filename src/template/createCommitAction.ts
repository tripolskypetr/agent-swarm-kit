import { GLOBAL_CONFIG } from "../config/params";
import { commitToolOutput } from "../functions/commit/commitToolOutput";
import { executeForce } from "../functions/target/executeForce";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName, ToolName } from "../interfaces/Agent.interface";
import { getAgentName } from "../functions/common/getAgentName";

const METHOD_NAME = "function.template.commitAction";


/**
 * Configuration parameters for creating a commit action handler.
 * Defines validation, action execution, and response messages.
 *
 * @template T - The type of parameters expected by the action
 * @interface ICommitActionParams
 * @property {(params: T, clientId: string, agentName: AgentName) => string | null | Promise<string | null>} [validateParams] - Optional function to validate action parameters. Returns error message string if validation fails, null if valid.
 * @property {(params: T, clientId: string, agentName: AgentName) => string | Promise<string>} executeAction - Function to execute the actual action (e.g., commitAppAction). Called only when parameters are valid and isLast is true. Returns result string to commit as tool output, or empty string if action produced no result.
 * @property {string | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>)} [unavailableMessage] - Optional message to commit when executeAction returns empty result.
 * @property {string | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>)} successMessage - Message to execute using executeForce after successful action execution.
 * @property {string | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>)} [failureMessage] - Optional message to execute using executeForce when validation fails.
 *
 * @example
 * // Create a payment action handler with validation
 * const paymentAction = createCommitAction({
 *   validateParams: async (params) => {
 *     if (!params.bank_name) return "Bank name is required";
 *     if (!params.amount) return "Amount is required";
 *     return null;
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
   * Optional function to validate action parameters.
   * Returns error message string if validation fails, null if valid.
   */
  validateParams?: (
    params: T,
    clientId: string,
    agentName: AgentName
  ) => string | null | Promise<string | null>;

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
   * Optional message to commit when executeAction returns empty result.
   */
  unavailableMessage?:
    | string
    | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>);

  /**
   * Message to execute using executeForce after successful action execution.
   */
  successMessage:
    | string
    | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>);

  /**
   * Optional message to execute using executeForce when validation fails.
   */
  failureMessage?:
    | string
    | ((params: T, clientId: string, agentName: AgentName) => string | Promise<string>);
}

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
 *     if (!params.amount) return "Amount is required";
 *     return null;
 *   },
 *   executeAction: async (params, clientId) => {
 *     await commitAppAction(clientId, "payment", params);
 *     return "Payment processed successfully";
 *   },
 *   successMessage: "Check your balance",
 * });
 * await handlePayment("tool-123", "client-456", "PaymentAgent", { amount: 100 }, true);
 */
export const createCommitAction = <T = Record<string, any>>({
  validateParams,
  executeAction,
  unavailableMessage,
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
          swarm.loggerService.log(
            `${toolName} skipped due to agent change`,
            {
              currentAgentName,
              agentName,
              clientId,
            }
          );
        if (isLast) {
          await executeForce(executeMessage, clientId);
        }
        return;
      }

      // Validate parameters if validation function is provided
      if (validateParams) {
        const errorMessage = await validateParams(params, clientId, agentName);

        if (errorMessage) {
          await commitToolOutput(toolId, errorMessage, clientId, agentName);

          // Execute failure message if provided
          if (failureMessage) {
            executeMessage =
              typeof failureMessage === "string"
                ? failureMessage
                : await failureMessage(params, clientId, agentName);
          }
          if (isLast) {
            await executeForce(executeMessage, clientId);
          }
          return;
        }
      }

      // Execute the action and get result
      const actionResult = await executeAction(params, clientId, agentName);

      // Commit action result as tool output
      if (actionResult) {
        await commitToolOutput(toolId, actionResult, clientId, agentName);
      } else {
        const message = unavailableMessage
          ? typeof unavailableMessage === "string"
            ? unavailableMessage
            : await unavailableMessage(params, clientId, agentName)
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
