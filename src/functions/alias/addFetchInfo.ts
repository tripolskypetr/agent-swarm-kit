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
 * Parameters for configuring fetch info tool.
 * @template T - The type of parameters expected by the fetch operation
 * @interface IFetchInfoToolParams
 * @extends IFetchInfoParams
 */
interface IFetchInfoToolParams<T = Record<string, any>>
  extends IFetchInfoParams<T> {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** Tool function schema. */
  function: IAgentTool["function"];
  /** Optional documentation note for the tool. */
  docNote?: string;
  /** Optional function to determine if the tool is available. */
  isAvailable?: IAgentTool["isAvailable"];
  /** Optional custom validation function that runs before tool execution. */
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
 * Creates and registers a fetch info tool for an agent to retrieve and provide information.
 * @function addFetchInfo
 * @template T - The type of parameters expected by the fetch operation
 * @param {IFetchInfoToolParams<T>} params - The parameters or configuration object.
 *
 * @example
 * // Add a user data fetch tool with validation
 * addFetchInfo({
 *   toolName: "fetch_user_data",
 *   function: {
 *     name: "fetch_user_data",
 *     description: "Fetch user data by user ID",
 *     parameters: {
 *       type: "object",
 *       properties: {
 *         userId: { type: "string", description: "User ID to fetch data for" },
 *       },
 *       required: ["userId"],
 *     },
 *   },
 *   validateParams: async (params) => {
 *     if (!params.userId) return false;
 *     return true;
 *   },
 *   fetchContent: async (params, clientId) => {
 *     return await getUserData(params.userId);
 *   },
 * });
 */
export function addFetchInfo<T = Record<string, any>>(
  params: IFetchInfoToolParams<T>
) {
  return addFetchInfoInternal(params);
}
