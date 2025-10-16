import { GLOBAL_CONFIG } from "../config/params";
import { commitToolOutput } from "../functions/commit/commitToolOutput";
import { execute } from "../functions/target/execute";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName } from "../interfaces/Agent.interface";

const METHOD_NAME = "function.template.fetchInfo";

/**
 * Configuration parameters for creating a fetch info handler.
 * Defines the data fetching logic and optional content transformation.
 *
 * @interface IFetchInfoParams
 * @property {(clientId: string, agentName: AgentName) => string | Promise<string>} fetchContent - Function to fetch the content/data to be provided to the agent. Receives client ID and agent name, returns content string or promise of string.
 * @property {string | ((content: string, clientId: string, agentName: AgentName) => string | Promise<string>)} [unavailableMessage] - Optional message or function to return when content is unavailable. If a function, receives the empty content, client ID, and agent name. Defaults to a generic unavailable message.
 * @property {(content: string, clientId: string, agentName: AgentName) => string | Promise<string>} [transformContent] - Optional function to transform fetched content before committing. Receives content, client ID, and agent name.
 *
 * @example
 * // Create a fetch info handler
 * const fetchUserData = await createFetchInfo({
 *   fetchContent: async (clientId) => await getUserData(clientId),
 *   transformContent: (data) => JSON.stringify(data, null, 2),
 * });
 * await fetchUserData("tool-123", "client-456", "UserAgent", "FetchUserData");
 */
export interface IFetchInfoParams {
  /**
   * Function to fetch the content/data to be provided to the agent.
   * This is the main data retrieval logic.
   */
  fetchContent: (
    clientId: string,
    agentName: AgentName
  ) => string | Promise<string>;

  /**
   * Optional message or function to return when content is unavailable.
   * Used when fetchContent returns empty/null content.
   */
  unavailableMessage?:
    | string
    | ((
        content: string,
        clientId: string,
        agentName: AgentName,
        toolName: string
      ) => string | Promise<string>);

  /**
   * Optional function to transform fetched content before committing.
   * Allows preprocessing or formatting of the fetched data.
   */
  transformContent?: (
    content: string,
    clientId: string,
    agentName: AgentName
  ) => string | Promise<string>;
}

/**
 * Default message when content is unavailable.
 */
const DEFAULT_UNAVAILABLE_MESSAGE = (
  _content: string,
  _clientId: string,
  _agentName: AgentName,
  toolName: string
) => `The tool named ${toolName} is not available. Do not ever call it again`;

/**
 * Creates a function to fetch and commit information for a given client and agent.
 * The factory generates a handler that fetches content, optionally transforms it,
 * emits an event, commits the output, and triggers execution if it's the last tool call.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @throws {Error} If any internal operation (e.g., fetch, commit, or execution) fails.
 *
 * @example
 * // Create a fetch info handler
 * const fetchHistory = await createFetchInfo({
 *   fetchContent: async (clientId, agentName) => {
 *     return await historyService.getHistory(clientId);
 *   },
 *   transformContent: (content) => `History:\n${content}`,
 * });
 * await fetchHistory("tool-789", "client-012", "HistoryAgent", "FetchHistory", true);
 */
export const createFetchInfo = ({
  fetchContent,
  unavailableMessage = DEFAULT_UNAVAILABLE_MESSAGE,
  transformContent,
}: IFetchInfoParams) => {
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
      isLast: boolean
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
          agentName,
          toolName,
          isLast,
        });

      let content = await fetchContent(clientId, agentName);

      if (content && transformContent) {
        content = await transformContent(content, clientId, agentName);
      }

      if (content) {
        await commitToolOutput(toolId, content, clientId, agentName);
      } else {
        const message =
          typeof unavailableMessage === "string"
            ? unavailableMessage
            : await unavailableMessage(content, clientId, agentName, toolName);
        await commitToolOutput(toolId, message, clientId, agentName);
      }

      if (isLast) {
        await execute("", clientId, agentName);
      }
    }
  );
};
