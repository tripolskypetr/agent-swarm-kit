/**
 * Adds navigation functionality to an agent by creating a tool that allows navigation to a specified agent.
 * @module addAgentNavigation
 */

import { AgentName, ToolName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import {
  createNavigateToAgent,
  INavigateToAgentParams,
} from "../../template/createNavigateToAgent";
import { addTool } from "../setup/addTool";

const METHOD_NAME = "function.alias.addAgentNavigation";

/**
 * Parameters for configuring agent navigation.
 * @interface IAgentNavigationParams
 * @extends INavigateToAgentParams
 */
interface IAgentNavigationParams extends INavigateToAgentParams {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** A description of the tool's functionality. */
  description: string;
  /** The target agent to navigate to. */
  navigateTo: AgentName;
  /** Optional documentation note for the tool. */
  docNote?: string;
}

/**
 * Function implementation
 */
const addAgentNavigationInternal = beginContext(
  ({
    toolName,
    docNote,
    description,
    navigateTo,
    ...navigateProps
  }: IAgentNavigationParams) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const navigate = createNavigateToAgent(navigateProps);

    const toolSchema = addTool({
      toolName,
      docNote,
      call: async ({ toolId, clientId, toolCalls }) => {
        if (toolCalls.length > 1) {
          console.error("agent-swarm addAgentNavigation model called multiple tools within navigation execution");
        }
        await navigate(toolId, clientId, navigateTo);
      },
      type: "function",
      function: {
        name: toolName,
        description,
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    });

    swarm.navigationSchemaService.register(toolName);

    return toolSchema;
  }
);

/**
 * Creates and registers a navigation tool for an agent to navigate to another specified agent.
 * @function addAgentNavigation
 * @param {IAgentNavigationParams} params - The parameters for configuring the navigation tool.
 * @param {ToolName} params.toolName - The name of the tool.
 * @param {string} params.description - Description of the tool's purpose.
 * @param {AgentName} params.navigateTo - The target agent to navigate to.
 * @param {string} [params.docNote] - Optional documentation note.
 * @param {...INavigateToAgentParams} params.navigateProps - Additional navigation properties.
 * @returns {ReturnType<typeof addTool>} The result of adding the navigation tool.
 */
export function addAgentNavigation(params: IAgentNavigationParams) {
  return addAgentNavigationInternal(params);
}
