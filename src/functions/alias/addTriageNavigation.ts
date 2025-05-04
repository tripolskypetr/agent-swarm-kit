/**
 * Adds triage navigation functionality to an agent by creating a tool that facilitates navigation to a triage agent.
 * @module addTriageNavigation
 */

import { AgentName, ToolName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import { addTool } from "../setup/addTool";
import { commitToolOutputForce } from "../commit/commitToolOutputForce";
import {
  createNavigateToTriageAgent,
  INavigateToTriageParams,
} from "../../template/createNavigateToTriageAgent";

const METHOD_NAME = "function.alias.addTriageNavigation";

const DEFAULT_SKIP_PLACEHOLDER = "Navigation canceled";

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
  /** Optional skip output value when got several navigations. */
  skipPlaceholder?: string;
}

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
export const addTriageNavigation = beginContext(
  ({
    toolName,
    docNote,
    description,
    skipPlaceholder = DEFAULT_SKIP_PLACEHOLDER,
    ...navigateProps
  }: ITriageNavigationParams) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);

    const navigate = createNavigateToTriageAgent(navigateProps);

    return addTool({
      toolName,
      docNote,
      call: async ({ toolId, clientId, isLast }) => {
        if (!isLast) {
          await commitToolOutputForce(toolId, skipPlaceholder, clientId);
          return;
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
  }
);
