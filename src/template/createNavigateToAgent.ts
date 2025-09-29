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
  /**
   * Optional callback function executed before navigation begins.
   * Allows for custom pre-navigation logic and validation.
   */
  beforeNavigate?: (
    clientId: string,
    lastMessage: string | null,
    lastAgent: AgentName,
    agentName: AgentName
  ) => void | Promise<void>;
  /**
   * Optional message or function to emit after flushing the session.
   * Used when navigation cannot be completed and the session needs to be reset.
   */
  flushMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  /**
   * Optional message or function for tool output when navigation occurs.
   * Provides feedback about the navigation operation to the model.
   */
  toolOutput?:
    | string
    | ((clientId: string, lastAgent: AgentName, agentName: AgentName) => string | Promise<string>);
  /**
   * Optional function to transform the last user message for navigation context.
   * Allows customization of how the previous message is processed.
   */
  lastMessage?: (
    clientId: string,
    lastMessage: string | null,
    lastAgent: AgentName,
    agentName: AgentName
  ) => string | Promise<string>;
  /**
   * Optional message or function to emit when navigation occurs without execution.
   * Used for navigation scenarios that only require message emission.
   */
  emitMessage?:
    | string
    | ((
        clientId: string,
        lastMessage: string,
        lastAgent: string,
        agentName: AgentName
      ) => string | Promise<string>);
  /**
   * Optional message or function to execute when navigation occurs with execution.
   * Used to define what message should be executed on the target agent after navigation.
   */
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
 */
const DEFAULT_TOOL_OUTPUT = (_: SessionId, lastAgent: AgentName, agentName: AgentName) =>
  `Successfully navigated from ${lastAgent} to ${agentName}. Please do not call the navigate tool to ${lastAgent} during the next answer`;

/**
 * Default flush message prompting the user to repeat their input.
 *
 */
const DEFAULT_FLUSH_MESSAGE = ({}: SessionId, {}: AgentName) =>
  `Sorry, I missed that. Could you repeat please`;

/**
 * Default function to retrieve the last user message for navigation scenarios.
 * Returns the last user message unchanged, ignoring the client and agent parameters.
 *
 */
const DEFAULT_LAST_MESSAGE_FN = (
  _: SessionId,
  lastMessage: string,
  lastAgent: AgentName
) => `User changed conversation topic. The next message recieved: ${lastMessage}. Continue conversation without navigation to ${lastAgent}`;

/**
 * Creates a function to navigate to a specified agent for a given client, handling navigation, message execution, emission, and tool output.
 * The factory generates a handler that checks navigation state, retrieves the last user message, commits tool outputs, and triggers execution or emission based on provided parameters.
 * It validates the presence of either `emitMessage` or `executeMessage` to ensure proper navigation behavior.
 * Logs the navigation operation if logging is enabled in the global configuration.
 *
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
  beforeNavigate,
  lastMessage: lastMessageFn = DEFAULT_LAST_MESSAGE_FN,
  executeMessage = DEFAULT_EXECUTE_MESSAGE,
  emitMessage,
  flushMessage = DEFAULT_FLUSH_MESSAGE,
  toolOutput = DEFAULT_TOOL_OUTPUT,
}: INavigateToAgentParams) => {
  /**
   * Navigates to a specified agent for a given client and tool, handling message commits, execution, or emission using the last user message.
   *
   * @throws {Error} If navigation, commit, execution, or emission operations fail (e.g., invalid clientId or agentName).
   */
  return beginContext(
    async (toolId: string, clientId: string, agentName: AgentName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
        });

      const lastMessageRaw = await getLastUserMessage(clientId);
      const lastAgent = await getAgentName(clientId);

      await commitStopToolsForce(clientId);

      if (
        await and(
          not(hasNavigation(clientId, agentName)),
          Promise.resolve(!emitMessage)
        )
      ) {
        const lastMessage = await lastMessageFn(
          clientId,
          lastMessageRaw,
          lastAgent,
          agentName
        );
        beforeNavigate && await beforeNavigate(clientId, lastMessage, lastAgent, agentName);
        await commitToolOutputForce(
          toolId,
          typeof toolOutput === "string"
            ? toolOutput
            : await toolOutput(clientId, lastAgent, agentName),
          clientId
        );
        await changeToAgent(agentName, clientId);
        await executeForce(
          typeof executeMessage === "string"
            ? executeMessage
            : await executeMessage(
                clientId,
                lastMessage,
                lastAgent,
                agentName
              ),
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
        const lastMessage = await lastMessageFn(
          clientId,
          lastMessageRaw,
          lastAgent,
          agentName
        );
        beforeNavigate && await beforeNavigate(clientId, lastMessage, lastAgent, agentName);
        await commitToolOutputForce(
          toolId,
          typeof toolOutput === "string"
            ? toolOutput
            : await toolOutput(clientId, lastAgent, agentName),
          clientId
        );
        await changeToAgent(agentName, clientId);
        await emitForce(
          typeof emitMessage === "string"
            ? emitMessage
            : await emitMessage(
                clientId,
                lastMessage,
                lastAgent,
                agentName
              ),
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
