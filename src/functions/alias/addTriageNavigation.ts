/**
 * Adds triage navigation functionality to an agent by creating a tool that facilitates navigation to a triage agent.
 * @module addTriageNavigation
*/

import { AgentName, IAgentTool, ToolName } from "../../interfaces/Agent.interface";
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
  /** The name of the tool to be created.*/
  toolName: ToolName;
  /** A description of the tool's functionality.*/
  description: string;
  /** Optional documentation note for the tool.*/
  docNote?: string;
  /** Optional function to determine if the tool is available.*/
  isAvailable?: IAgentTool["isAvailable"];
}

/**
 * Function implementation
*/
const addTriageNavigationInternal = beginContext(
  ({
    toolName,
    docNote,
    description,
    isAvailable,
    ...navigateProps
  }: ITriageNavigationParams) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const navigate = createNavigateToTriageAgent(navigateProps);

    const toolSchema = addTool({
      toolName,
      docNote,
      isAvailable,
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
 * @param {ITriageNavigationParams} params - The parameters or configuration object.
*/
export function addTriageNavigation(params: ITriageNavigationParams) {
  return addTriageNavigationInternal(params);
}
