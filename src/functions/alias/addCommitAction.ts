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
import { ITool } from "../../model/Tool.model";

const METHOD_NAME = "function.alias.addCommitAction";

/**
 * Parameters for configuring commit action tool.
 * @template T - The type of parameters expected by the action
 * @interface ICommitActionToolParams
 * @extends ICommitActionParams
 */
interface ICommitActionToolParams<T = Record<string, any>>
  extends ICommitActionParams<T> {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** A description of the tool's functionality. */
  description: string;
  /** Tool function schema defining parameters and their validation. */
  functionSchema: Omit<ITool["function"], "name"> | ((clientId: string, agentName: AgentName) => Omit<ITool["function"], "name"> | Promise<Omit<ITool["function"], "name">>);
  /** Optional documentation note for the tool. */
  docNote?: string;
  /** Optional function to determine if the tool is available. */
  isAvailable?: IAgentTool["isAvailable"];
  /** Optional custom validation function that runs before tool execution. */
  validate?: IAgentTool<T>["validate"];
}

/**
 * Function implementation
 */
const addCommitActionInternal = beginContext(
  <T = Record<string, any>>({
    toolName,
    docNote,
    description,
    functionSchema,
    isAvailable,
    validate,
    ...actionProps
  }: ICommitActionToolParams<T>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const action = createCommitAction<T>(actionProps);

    const toolSchema = addTool<T>({
      toolName,
      docNote,
      isAvailable,
      validate,
      call: async ({ toolId, clientId, agentName, toolName, params, isLast }) => {
        await action(toolId, clientId, agentName, toolName, params, isLast);
      },
      type: "function",
      function: async (clientId: string, agentName: AgentName) => {
        const resolvedSchema = typeof functionSchema === "function"
          ? await functionSchema(clientId, agentName)
          : functionSchema;

        return {
          name: toolName,
          description,
          ...resolvedSchema,
        };
      },
    });

    swarm.actionSchemaService.register(toolName);

    return toolSchema;
  }
);

/**
 * Creates and registers a commit action tool for an agent to validate and execute actions.
 * @function addCommitAction
 * @template T - The type of parameters expected by the action
 * @param {ICommitActionToolParams<T>} params - The parameters or configuration object.
 *
 * @example
 * // Add a payment tool with validation
 * addCommitAction({
 *   toolName: "pay_credit",
 *   description: "Process credit payment",
 *   functionSchema: {
 *     parameters: {
 *       type: "object",
 *       properties: {
 *         bank_name: { type: "string", enum: ["bank1", "bank2"] },
 *         amount: { type: "string", description: "Amount in currency" },
 *       },
 *       required: ["bank_name", "amount"],
 *     },
 *   },
 *   validateParams: async (params) => {
 *     const errors: ValidationErrors = {};
 *     if (!params.bank_name) errors.bank_name = "Bank name required";
 *     if (!params.amount) errors.amount = "Amount required";
 *     return { isValid: Object.keys(errors).length === 0, errors };
 *   },
 *   executeAction: async (params, clientId) => {
 *     await commitAppAction(clientId, "credit-payment", params);
 *   },
 *   successMessage: "Payment page opened successfully",
 *   followUpMessage: "what is this page about",
 * });
 */
export function addCommitAction<T = Record<string, any>>(
  params: ICommitActionToolParams<T>
) {
  return addCommitActionInternal(params);
}
