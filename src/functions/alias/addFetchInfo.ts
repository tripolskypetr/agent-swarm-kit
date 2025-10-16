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
 * @interface IFetchInfoToolParams
 * @extends IFetchInfoParams
 */
interface IFetchInfoToolParams extends IFetchInfoParams {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** A description of the tool's functionality. */
  description:
    | string
    | ((clientId: string, agentName: AgentName) => string | Promise<string>);
  /** Optional documentation note for the tool. */
  docNote?: string;
  /** Optional function to determine if the tool is available. */
  isAvailable?: IAgentTool["isAvailable"];
}

/**
 * Function implementation
 */
const addFetchInfoInternal = beginContext(
  ({
    toolName,
    docNote,
    description,
    isAvailable,
    ...fetchProps
  }: IFetchInfoToolParams) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const fetch = createFetchInfo(fetchProps);

    const toolSchema = addTool({
      toolName,
      docNote,
      isAvailable,
      call: async ({
        toolId,
        clientId,
        agentName,
        toolName: toolNameParam,
        isLast,
      }) => {
        await fetch(toolId, clientId, agentName, toolNameParam, isLast);
      },
      type: "function",
      function: async (clientId: string, agentName: AgentName) => {
        const resolvedDescription =
          typeof description === "string"
            ? description
            : await description(clientId, agentName);

        return {
          name: toolName,
          description: resolvedDescription,
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        };
      },
    });

    return toolSchema;
  }
);

/**
 * Creates and registers a fetch info tool for an agent to retrieve and provide information.
 * @function addFetchInfo
 * @param {IFetchInfoToolParams} params - The parameters or configuration object.
 */
export function addFetchInfo(params: IFetchInfoToolParams) {
  return addFetchInfoInternal(params);
}
