/**
 * Adds commit action functionality to an agent by creating a tool that validates and executes actions.
 * @module addCommitAction
 */

import { AgentName, IAgentTool, ToolName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import {
  createCommitAction,
  ICommitActionParams,
} from "../../template/createCommitAction";
import { addTool } from "../setup/addTool";

const METHOD_NAME = "function.alias.addCommitAction";

/**
 * Parameters for configuring commit action tool (WRITE pattern).
 * Creates a tool that executes actions and modifies system state.
 *
 * @template T - The type of parameters expected by the action
 * @interface ICommitActionToolParams
 * @extends ICommitActionParams
 *
 * @property {ToolName} toolName - The name of the tool to be created
 * @property {IAgentTool["function"]} function - Tool function schema (name, description, parameters)
 * @property {string} [docNote] - Optional documentation note for the tool
 * @property {IAgentTool["isAvailable"]} [isAvailable] - Optional function to determine if the tool is available
 * @property {ICommitActionParams<T>["validateParams"]} [validateParams] - Optional validation function (inherited from ICommitActionParams)
 *   - Receives dto object: { clientId, agentName, toolCalls, params }
 *   - Returns: error message string if invalid, null if valid
 * @property {ICommitActionParams<T>["executeAction"]} executeAction - Function that executes the action and returns result
 *   - Receives: (params, clientId, agentName)
 *   - Returns: string result to commit as tool output
 * @property {ICommitActionParams<T>["emptyContent"]} [emptyContent] - Optional handler for empty action results
 *   - Receives: (params, clientId, agentName)
 *   - Returns: string message to commit as tool output
 * @property {ICommitActionParams<T>["successMessage"]} successMessage - Message to execute after successful action
 *   - Can be string or function: (params, clientId, agentName) => string
 * @property {ICommitActionParams<T>["failureMessage"]} [failureMessage] - Optional message to execute after validation failure
 *   - Can be string or function: (params, clientId, agentName) => string
 */
interface ICommitActionToolParams<T = Record<string, any>>
  extends ICommitActionParams<T> {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** Tool function schema (name, description, parameters). */
  function: IAgentTool["function"];
  /** Optional documentation note for the tool. */
  docNote?: string;
  /** Optional function to determine if the tool is available. */
  isAvailable?: IAgentTool["isAvailable"];
}

/**
 * Function implementation
 */
const addCommitActionInternal = beginContext(
  <T = Record<string, any>>({
    toolName,
    docNote,
    function: functionSchema,
    isAvailable,
    ...actionProps
  }: ICommitActionToolParams<T>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const action = createCommitAction<T>(actionProps);

    const toolSchema = addTool<T>({
      toolName,
      docNote,
      isAvailable,
      validate: () => true,
      call: async ({ toolId, clientId, agentName, toolName, params, toolCalls, isLast }) => {
        await action(toolId, clientId, agentName, toolName, params, toolCalls, isLast);
      },
      type: "function",
      function: functionSchema,
    });

    swarm.actionSchemaService.register(toolName);

    return toolSchema;
  }
);

/**
 * Creates and registers a commit action tool for AI to execute actions (WRITE pattern).
 * This implements the WRITE side of the command pattern - AI calls tool to modify system state.
 *
 * **Flow:**
 * 1. AI calls tool with parameters
 * 2. validateParams runs (if provided) - validates parameters and returns error message or null
 * 3. If validation fails:
 *    - Error message is committed as tool output
 *    - failureMessage is executed (or error message if failureMessage not provided)
 *    - Flow stops
 * 4. If validation passes:
 *    - executeAction runs - performs the action
 *    - Action result is committed as tool output (or emptyContent if result is empty)
 *    - successMessage is executed
 *
 * @function addCommitAction
 * @template T - The type of parameters expected by the action
 * @param {ICommitActionToolParams<T>} params - Configuration object for the action tool
 * @returns {IAgentTool} The registered agent tool schema
 *
 * @example
 * // Payment action with validation and follow-up
 * addCommitAction({
 *   toolName: "pay_credit",
 *   function: {
 *     name: "pay_credit",
 *     description: "Process credit payment",
 *     parameters: {
 *       type: "object",
 *       properties: {
 *         bank_name: { type: "string", enum: ["bank1", "bank2"] },
 *         amount: { type: "string", description: "Amount in currency" },
 *       },
 *       required: ["bank_name", "amount"],
 *     },
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
 *   failureMessage: "Could not process payment",
 * });
 */
export function addCommitAction<T = Record<string, any>>(
  params: ICommitActionToolParams<T>
) {
  return addCommitActionInternal(params);
}
