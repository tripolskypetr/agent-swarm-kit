import { GLOBAL_CONFIG } from "../config/params";;
import { executeForce } from "../functions/target/executeForce";
import { commitToolOutputForce } from "../functions/commit/commitToolOutputForce"
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName } from "../interfaces/Agent.interface";
import { getAgentName } from "../functions/common/getAgentName";

const METHOD_NAME = "function.template.fetchInfo";

/**
 * Configuration parameters for creating a fetch info handler.
 * Defines the data fetching logic and optional content transformation.
 *
 * @template T - The type of parameters expected by the fetch operation
 * @interface IFetchInfoParams
 * @property {(params: T, clientId: string, agentName: AgentName) => string | Promise<string>} fetchContent - Function to fetch the content/data to be provided to the agent. Receives params, client ID and agent name, returns content string or promise of string.
 * @property {(content: string, clientId: string, agentName: AgentName, toolName: string) => string | Promise<string>} [emptyContent] - Optional function to handle when fetchContent returns empty result. Returns message to commit as tool output.
 *
 * @example
 * // Create a fetch info handler
 * const fetchUserData = await createFetchInfo({
 *   fetchContent: async (params, clientId) => await getUserData(params.userId),
 * });
 * await fetchUserData("tool-123", "client-456", "UserAgent", "FetchUserData", { userId: "123" }, true);
 */
export interface IFetchInfoParams<T = Record<string, any>> {
  /**
   * Function to fetch the content/data to be provided to the agent.
   * This is the main data retrieval logic.
   */
  fetchContent: (
    params: T,
    clientId: string,
    agentName: AgentName
  ) => string | Promise<string>;

  /**
   * Optional function to handle when fetchContent returns empty result.
   * Returns message to commit as tool output.
   */
  emptyContent?: (
    content: string,
    clientId: string,
    agentName: AgentName,
    toolName: string
  ) => string | Promise<string>;
}

/**
 * Default message when content is empty.
 */
const DEFAULT_EMPTY_CONTENT_MESSAGE = (
  _content: string,
  _clientId: string,
  _agentName: AgentName,
  toolName: string
) => `The tool named ${toolName} is not available. Do not ever call it again`;

/**
 * Creates a function to fetch and commit information for a given client and agent.
 * The factory generates a handler that fetches content, commits the output,
 * and triggers execution if it's the last tool call.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @throws {Error} If any internal operation (e.g., fetch, commit, or execution) fails.
 *
 * @example
 * // Create a fetch info handler
 * const fetchHistory = await createFetchInfo({
 *   fetchContent: async (params, clientId, agentName) => {
 *     return await historyService.getHistory(clientId);
 *   },
 * });
 * await fetchHistory("tool-789", "client-012", "HistoryAgent", "FetchHistory", {}, true);
 */
export const createFetchInfo = <T = Record<string, any>>({
  fetchContent,
  emptyContent = DEFAULT_EMPTY_CONTENT_MESSAGE,
}: IFetchInfoParams<T>) => {
  /**
   * Fetches information and commits it as tool output for a given client and agent.
   *
   * @throws {Error} If fetch, commit, or execution operations fail.
   */
  return beginContext(
    async (
      toolId: string,
      clientId: string,
      agentName: AgentName,
      toolName: string,
      params: T,
      isLast: boolean
    ) => {
      let executeMessage = "";

      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
          agentName,
          toolName,
          params,
          isLast,
        });

      const currentAgentName = await getAgentName(clientId);
      if (currentAgentName !== agentName) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
          swarm.loggerService.log(
            `${METHOD_NAME} skipped due to agent change`,
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

      const content = await fetchContent(params, clientId, agentName);

      if (content) {
        await commitToolOutputForce(toolId, content, clientId);
      } else {
        const message = await emptyContent(content, clientId, agentName, toolName);
        await commitToolOutputForce(toolId, message, clientId);
      }

      if (isLast) {
        await executeForce(executeMessage, clientId);
      }
    }
  );
};
