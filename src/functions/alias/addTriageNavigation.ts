/**
 * Adds triage navigation functionality to an agent by creating a tool that facilitates navigation to a triage agent.
 * @module addTriageNavigation
 */

import { AgentName, ToolName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import { addTool } from "../setup/addTool";
import {
  createNavigateToTriageAgent,
  INavigateToTriageParams,
} from "../../template/createNavigateToTriageAgent";

const METHOD_NAME = "function.alias.addTriageNavigation";

/**
 * Parameters for configuring triage navigation.
 * @interface ITriageNavigationParams
 * @extends INavigateToTriageParams
 */
interface ITriageNavigationParams extends INavigateToTriageParams {
  /** The name of the tool to be created. */
  toolName: ToolName;
  /** A description of the tool's functionality. */
  description: string;
  /** Optional documentation note for the tool. */
  docNote?: string;
}

/**
 * Function implementation
 */
const addTriageNavigationInternal = beginContext(
  ({
    toolName,
    docNote,
    description,
    ...navigateProps
  }: ITriageNavigationParams) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const navigate = createNavigateToTriageAgent(navigateProps);

    const toolSchema = addTool({
      toolName,
      docNote,
      call: async ({ toolId, clientId, toolCalls }) => {
        if (toolCalls.length > 1) {
          console.error("agent-swarm addTriageNavigation model called multiple tools within navigation execution");
        }
        await navigate(toolId, clientId);
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
 * Creates and registers a triage navigation tool for an agent to navigate to a triage agent.
 * @function addTriageNavigation
 * @param {ITriageNavigationParams} params - The parameters for configuring the triage navigation tool.
 * @param {ToolName} params.toolName - The name of the tool.
 * @param {string} params.description - Description of the tool's purpose.
 * @param {string} [params.docNote] - Optional documentation note.
 * @param {...INavigateToTriageParams} params.navigateProps - Additional triage navigation properties.
 * @returns {ReturnType<typeof addTool>} The result of adding the triage navigation tool.
 */
export function addTriageNavigation(params: ITriageNavigationParams) {
  return addTriageNavigationInternal(params);
}
