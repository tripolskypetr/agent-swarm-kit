/**
 * Adds fetch info functionality to an agent by creating a tool that fetches and provides information.
 * @module addFetchInfo
 */

import {
  AgentName,
  IAgentTool,
  ToolName,
} from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import {
  createFetchInfo,
  IFetchInfoParams,
} from "../../template/createFetchInfo";
import { addTool } from "../setup/addTool";

const METHOD_NAME = "function.alias.addFetchInfo";

/**
 * Parameters for configuring fetch info tool (READ pattern).
 * Creates a tool that fetches and returns data to the AI without modifying system state.
 *
 * @template T - The type of parameters expected by the fetch operation
 * @interface IFetchInfoToolParams
 * @extends IFetchInfoParams
 *
 * @property {ToolName} toolName - The name of the tool to be created
 * @property {IAgentTool["function"]} function - Tool function schema (name, description, parameters)
 * @property {string} [docNote] - Optional documentation note for the tool
 * @property {IAgentTool["isAvailable"]} [isAvailable] - Optional function to determine if the tool is available
 * @property {IFetchInfoParams<T>["fallback"]} [fallback] - Optional error handler for fetchContent failures (inherited from IFetchInfoParams)
 *   - Receives: (error: Error, clientId: string, agentName: AgentName)
 *   - Called when fetchContent throws an exception
 * @property {IAgentTool<T>["validate"]} [validateParams] - Optional validation function that runs before fetchContent
 *   - Receives dto object: { clientId, agentName, toolCalls, params }
 *   - Returns boolean: true if valid, false if invalid (blocks tool execution)
 * @property {IFetchInfoParams<T>["fetchContent"]} fetchContent - Function to fetch and return content to AI
 *   - Receives: (params, clientId, agentName)
 *   - Returns: string content or empty string
 * @property {IFetchInfoParams<T>["emptyContent"]} [emptyContent] - Optional handler for empty fetch results
 *   - Receives: (content, clientId, agentName, toolName)
 *   - Returns: string message to commit as tool output
 */
interface IFetchInfoToolParams<T = Record<string, any>>
  extends IFetchInfoParams<T> {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** Tool function schema (name, description, parameters). */
  function: IAgentTool["function"];
  /** Optional documentation note for the tool. */
  docNote?: string;
  /** Optional function to determine if the tool is available. */
  isAvailable?: IAgentTool["isAvailable"];
  /** Optional validation function that runs before fetchContent. Returns boolean (true if valid, false if invalid). */
  validateParams?: IAgentTool<T>["validate"];
}

/**
 * Function implementation
 */
const addFetchInfoInternal = beginContext(
  <T = Record<string, any>>({
    toolName,
    docNote,
    function: functionSchema,
    isAvailable,
    validateParams: validate,
    ...fetchProps
  }: IFetchInfoToolParams<T>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const fetch = createFetchInfo<T>(fetchProps);

    const toolSchema = addTool<T>({
      toolName,
      docNote,
      isAvailable,
      validate,
      call: async ({ toolId, clientId, agentName, toolName, params, isLast }) => {
        await fetch(toolId, clientId, agentName, toolName, params, isLast);
      },
      type: "function",
      function: functionSchema,
    });

    return toolSchema;
  }
);

/**
 * Creates and registers a fetch info tool for AI to retrieve data (READ pattern).
 * This implements the READ side of the command pattern - AI calls tool to get information without modifying state.
 *
 * **Flow:**
 * 1. AI calls tool with parameters
 * 2. validateParams runs (if provided) - validates parameters structure. Returns true if valid, false if invalid
 * 3. If validation fails (returns false), tool execution is blocked
 * 4. If validation passes, fetchContent executes - retrieves data
 * 5. AI receives fetched content as tool output
 * 6. If content is empty, emptyContent handler is called
 *
 * @function addFetchInfo
 * @template T - The type of parameters expected by the fetch operation
 * @param {IFetchInfoToolParams<T>} params - Configuration object for the fetch tool
 * @returns {IAgentTool} The registered agent tool schema
 *
 * @example
 * // Fetch user data with parameter validation and error handling
 * addFetchInfo({
 *   toolName: "fetch_user_data",
 *   function: {
 *     name: "fetch_user_data",
 *     description: "Fetch user data by user ID",
 *     parameters: {
 *       type: "object",
 *       properties: {
 *         userId: { type: "string", description: "User ID to fetch" },
 *       },
 *       required: ["userId"],
 *     },
 *   },
 *   fallback: (error, clientId, agentName) => {
 *     logger.error("Failed to fetch user data", { error, clientId, agentName });
 *   },
 *   validateParams: async ({ params, clientId, agentName, toolCalls }) => {
 *     // Returns true if valid, false if invalid
 *     return !!params.userId;
 *   },
 *   fetchContent: async (params, clientId) => {
 *     const userData = await getUserData(params.userId);
 *     return JSON.stringify(userData);
 *   },
 *   emptyContent: (content) => content || "User not found",
 * });
 */
export function addFetchInfo<T = Record<string, any>>(
  params: IFetchInfoToolParams<T>
) {
  return addFetchInfoInternal(params);
}
