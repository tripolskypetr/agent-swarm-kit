import { GLOBAL_CONFIG } from "../config/params";
import { executeForce } from "../functions/target/executeForce";
import { commitToolOutputForce } from "../functions/commit/commitToolOutputForce";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName } from "../interfaces/Agent.interface";
import { getAgentName } from "../functions/common/getAgentName";
import { CATCH_SYMBOL, getErrorMessage, trycatch } from "functools-kit";

const METHOD_NAME = "function.template.fetchInfo";

/**
 * Configuration parameters for creating a fetch info handler (READ pattern).
 * Defines the data fetching logic without modifying system state.
 *
 * @template T - The type of parameters expected by the fetch operation
 * @interface IFetchInfoParams
 *
 * @property {function} [fallback] - Optional error handler for fetchContent failures
 *   - @param {Error} error - The error object thrown during fetch
 *   - @param {string} clientId - The client identifier
 *   - @param {AgentName} agentName - The name of the current agent
 *   - Called when fetchContent throws an exception
 *   - Error message is automatically passed to emptyContent handler
 *
 * @property {function} fetchContent - Function to fetch the content/data to be provided to the AI agent
 *   - @param {T} params - Tool call parameters (validated if validateParams was provided in addFetchInfo)
 *   - @param {string} clientId - The client identifier
 *   - @param {AgentName} agentName - The name of the current agent
 *   - @returns {string | Promise<string>} Content string to return to AI as tool output
 *
 * @property {function} [emptyContent] - Optional function to handle when fetchContent returns empty result
 *   - @param {string} content - The empty content from fetchContent
 *   - @param {string} clientId - The client identifier
 *   - @param {AgentName} agentName - The name of the current agent
 *   - @param {string} toolName - The tool name
 *   - @returns {string | Promise<string>} Message to commit as tool output
 *   - @default "The tool named {toolName} is not available. Do not ever call it again"
 *
 * @example
 * // Fetch user data from database with error handling
 * const fetchUserData = createFetchInfo({
 *   fallback: (error, clientId, agentName) => {
 *     console.error(`Failed to fetch user data for ${clientId} (${agentName}):`, error);
 *   },
 *   fetchContent: async (params, clientId) => {
 *     const user = await getUserData(params.userId);
 *     return JSON.stringify(user);
 *   },
 *   emptyContent: (content) => content || "User not found",
 * });
 * await fetchUserData("tool-123", "client-456", "UserAgent", "FetchUserData", { userId: "123" }, true);
 */
export interface IFetchInfoParams<T = Record<string, any>> {
  /**
   * Optional function to handle errors during fetch execution.
   * Receives the error object, client ID, and agent name.
   */
  fallback?: (error: Error, clientId: string, agentName: AgentName) => void;

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
 * Creates a fetch info handler that retrieves data for AI without modifying system state (READ pattern).
 *
 * **Execution flow:**
 * 1. Checks if agent hasn't changed during execution
 * 2. Calls fetchContent with parameters (wrapped in trycatch)
 *    - If fetchContent throws: calls fallback handler (if provided) → passes error message to emptyContent → commits result
 * 3. If content exists: commits it as tool output
 * 4. If content is empty: calls emptyContent handler and commits result
 * 5. If this is the last tool call (isLast): executes executeForce (always with empty message for fetch)
 *
 * @template T - The type of parameters expected by the fetch operation
 * @param {IFetchInfoParams<T>} config - Configuration object
 * @returns {function} Handler function that executes the fetch operation
 *
 * @throws {Error} If fetch, commit, or execution operations fail
 *
 * @example
 * // Fetch conversation history with error handling
 * const fetchHistory = createFetchInfo({
 *   fallback: (error, clientId, agentName) => {
 *     logger.error("Failed to fetch history", { error, clientId, agentName });
 *   },
 *   fetchContent: async (params, clientId, agentName) => {
 *     const history = await historyService.getHistory(clientId);
 *     return JSON.stringify(history);
 *   },
 *   emptyContent: (content) => content || "No history found",
 * });
 * // Usage: called internally by addFetchInfo
 * await fetchHistory("tool-789", "client-012", "HistoryAgent", "FetchHistory", {}, true);
 */
export const createFetchInfo = <T = Record<string, any>>({
  fetchContent,
  fallback,
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

      let error: Error;

      const runner = trycatch(fetchContent, {
        fallback: (e) => {
          error = e;
          fallback && fallback(e, clientId, agentName);
        },
      });

      const content = await runner(params, clientId, agentName);

      if (content === CATCH_SYMBOL) {
        const message = await emptyContent(
          getErrorMessage(error),
          clientId,
          agentName,
          toolName
        );
        await commitToolOutputForce(toolId, message, clientId);
      } else if (content) {
        await commitToolOutputForce(toolId, content, clientId);
      } else {
        const message = await emptyContent(
          content,
          clientId,
          agentName,
          toolName
        );
        await commitToolOutputForce(toolId, message, clientId);
      }

      if (isLast) {
        await executeForce(executeMessage, clientId);
      }
    }
  );
};
