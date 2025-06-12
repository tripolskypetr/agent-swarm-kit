import { and, not } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { commitFlushForce } from "../functions/commit/commitFlushForce";
import { commitToolOutputForce } from "../functions/commit/commitToolOutputForce";
import { hasNavigation } from "../functions/common/hasNavigation";
import { emitForce } from "../functions/target/emitForce";
import { executeForce } from "../functions/target/executeForce";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName } from "../interfaces/Agent.interface";
import { SessionId } from "../interfaces/Session.interface";
import { changeToAgent } from "../functions/navigate/changeToAgent";
import { getLastUserMessage } from "../functions/history/getLastUserMessage";
import { getAgentName } from "../functions/common/getAgentName";
import { commitStopToolsForce } from "../functions/commit/commitStopToolsForce";

const METHOD_NAME = "function.template.navigateToAgent";

/**
 * Will send tool output directly to the model without any additions
 */
const DEFAULT_EXECUTE_MESSAGE = "";

/**
 * Configuration parameters for creating a navigation handler to a specific agent.
 * Defines optional messages or functions to handle flush, emission, execution, and tool output scenarios during navigation, incorporating the last user message where applicable.
 *
 * @interface INavigateToAgentParams
 * @property {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [flushMessage] - Optional message or function to emit after flushing the session. If a function, it receives the client ID and agent name, returning a string or promise of a string. Defaults to a generic retry message.
 * @property {string | ((clientId: string, agentName: AgentName) => string | Promise<string>)} [toolOutput] - Optional message or function for tool output when navigation occurs. If a function, it receives the client ID and agent name, returning a string or promise of a string. Defaults to a message indicating successful navigation.
 * @property {string | ((clientId: string, lastMessage: string, agentName: AgentName) => string | Promise<string>)} [emitMessage] - Optional message or function to emit when navigation occurs without execution. If a function, it receives the client ID, last user message, and agent name, returning a string or promise of a string.
 * @property {string | ((clientId: string, lastMessage: string, agentName: AgentName) => string | Promise<string>)} [executeMessage] - Optional message or function to execute when navigation occurs with execution. If a function, it receives the client ID, last user message, and agent name, returning a string or promise of a string.
 *
 * @example
 * // Static message configuration
 * const params: INavigateToAgentParams = {
 *   flushMessage: "Session reset.",
 *   toolOutput: "Navigation completed.",
 * };
 *
 * @example
 * // Dynamic message configuration with last message
 * const params: INavigateToAgentParams = {
 *   executeMessage: (clientId, lastMessage, agent) => `Processing ${lastMessage} for ${clientId} on ${agent}`,
 *   emitMessage: (clientId, lastMessage, agent) => `Emitted ${lastMessage} for ${clientId} on ${agent}`,
 * };
 */
export interface INavigateToAgentParams {
  flushMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  toolOutput?:
    | string
    | ((clientId: string, agentName: AgentName) => string | Promise<string>);
  emitMessage?:
    | string
    | ((
        clientId: string,
        lastMessage: string,
        lastAgent: string,
        agentName: AgentName
      ) => string | Promise<string>);
  executeMessage?:
    | string
    | ((
        clientId: string,
        lastMessage: string,
        lastAgent: string,
        agentName: AgentName
      ) => string | Promise<string>);
}

/**
 * Default tool output message indicating successful navigation to the specified agent.
 *
 * @param {SessionId} _ - The client session ID (unused).
 * @param {AgentName} agentName - The name of the agent navigated to.
 * @returns {string} A message confirming navigation to the agent.
 */
const DEFAULT_TOOL_OUTPUT = (_: SessionId, agentName: AgentName) =>
  `Successfully navigated to ${agentName}`;

/**
 * Default flush message prompting the user to repeat their input.
 *
 * @param {SessionId} _ - The client session ID (unused).
 * @param {AgentName} _ - The agent name (unused).
 * @returns {string} A generic retry message.
 */
const DEFAULT_FLUSH_MESSAGE = ({}: SessionId, {}: AgentName) =>
  `Sorry, I missed that. Could you repeat please`;

/**
 * Creates a function to navigate to a specified agent for a given client, handling navigation, message execution, emission, and tool output.
 * The factory generates a handler that checks navigation state, retrieves the last user message, commits tool outputs, and triggers execution or emission based on provided parameters.
 * It validates the presence of either `emitMessage` or `executeMessage` to ensure proper navigation behavior.
 * Logs the navigation operation if logging is enabled in the global configuration.
 *
 * @param {IFactoryParams} params - Configuration parameters for the navigation handler.
 * @param {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [params.flushMessage] - Optional message or function to emit after flushing the session, defaults to `DEFAULT_FLUSH_MESSAGE`.
 * @param {string | ((clientId: string, agentName: AgentName) => string | Promise<string>)} [params.toolOutput] - Optional message or function for tool output when navigation occurs, defaults to `DEFAULT_TOOL_OUTPUT`.
 * @param {string | ((clientId: string, lastMessage: string, agentName: AgentName) => string | Promise<string>)} [params.emitMessage] - Optional message or function to emit when navigation occurs without execution.
 * @param {string | ((clientId: string, lastMessage: string, agentName: AgentName) => string | Promise<string>)} [params.executeMessage] - Optional message or function to execute when navigation occurs with execution.
 * @returns {Promise<(toolId: string, clientId: string, agentName: AgentName) => Promise<void>>} A promise resolving to a function that handles navigation to the specified agent.
 * @throws {Error} If neither `emitMessage` nor `executeMessage` is provided, or if any internal operation (e.g., navigation, commit, or execution) fails.
 *
 * @example
 * // Create a navigation handler with static messages
 * const navigate = await createNavigateToAgent({
 *   flushMessage: "Session reset.",
 *   toolOutput: "Navigation completed.",
 *   emitMessage: "Navigation event triggered.",
 * });
 * await navigate("tool-123", "client-456", "WeatherAgent");
 * // Navigates to WeatherAgent, commits tool output, and emits the message.
 *
 * @example
 * // Create a navigation handler with dynamic messages
 * const navigate = await createNavigateToAgent({
 *   executeMessage: (clientId, lastMessage, agent) => `Processing ${lastMessage} for ${clientId} on ${agent}`,
 *   toolOutput: (clientId, agent) => `Navigated ${clientId} to ${agent}`,
 * });
 * await navigate("tool-789", "client-012", "SupportAgent");
 * // Navigates to SupportAgent, commits dynamic tool output, and executes the message with the last user message.
 */
export const createNavigateToAgent = ({
  executeMessage = DEFAULT_EXECUTE_MESSAGE,
  emitMessage,
  flushMessage = DEFAULT_FLUSH_MESSAGE,
  toolOutput = DEFAULT_TOOL_OUTPUT,
}: INavigateToAgentParams) => {
  /**
   * Navigates to a specified agent for a given client and tool, handling message commits, execution, or emission using the last user message.
   *
   * @param {string} toolId - The identifier of the tool triggering the navigation.
   * @param {string} clientId - The unique identifier of the client session.
   * @param {AgentName} agentName - The name of the agent to navigate to.
   * @returns {Promise<void>} A promise that resolves when the navigation and associated actions are complete.
   * @throws {Error} If navigation, commit, execution, or emission operations fail (e.g., invalid clientId or agentName).
   */
  return beginContext(
    async (toolId: string, clientId: string, agentName: AgentName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
        });

      const lastMessage = await getLastUserMessage(clientId);
      const lastAgent = await getAgentName(clientId);

      await commitStopToolsForce(clientId);

      if (
        await and(
          not(hasNavigation(clientId, agentName)),
          Promise.resolve(!emitMessage)
        )
      ) {
        await commitToolOutputForce(
          toolId,
          typeof toolOutput === "string"
            ? toolOutput
            : await toolOutput(clientId, agentName),
          clientId
        );
        await changeToAgent(agentName, clientId);
        await executeForce(
          typeof executeMessage === "string"
            ? executeMessage
            : await executeMessage(clientId, lastMessage, lastAgent, agentName),
          clientId
        );
        return;
      }

      if (
        await and(
          not(hasNavigation(clientId, agentName)),
          Promise.resolve(!!emitMessage)
        )
      ) {
        await commitToolOutputForce(
          toolId,
          typeof toolOutput === "string"
            ? toolOutput
            : await toolOutput(clientId, agentName),
          clientId
        );
        await changeToAgent(agentName, clientId);
        await emitForce(
          typeof emitMessage === "string"
            ? emitMessage
            : await emitMessage(clientId, lastMessage, lastAgent, agentName),
          clientId
        );
        return;
      }

      await commitFlushForce(clientId);
      await emitForce(
        typeof flushMessage === "string"
          ? flushMessage
          : await flushMessage(clientId, agentName),
        clientId
      );
    }
  );
};
