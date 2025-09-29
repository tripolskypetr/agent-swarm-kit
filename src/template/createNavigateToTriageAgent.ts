import { not } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { commitFlushForce } from "../functions/commit/commitFlushForce";
import { commitToolOutputForce } from "../functions/commit/commitToolOutputForce";
import { hasNavigation } from "../functions/common/hasNavigation";
import { getLastUserMessage } from "../functions/history/getLastUserMessage";
import { changeToDefaultAgent } from "../functions/navigate/changeToDefaultAgent";
import { emitForce } from "../functions/target/emitForce";
import { executeForce } from "../functions/target/executeForce";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { AgentName } from "../interfaces/Agent.interface";
import { SessionId } from "../interfaces/Session.interface";
import { getAgentName } from "../functions/common/getAgentName";
import { commitStopToolsForce } from "../functions/commit/commitStopToolsForce";

const METHOD_NAME = "function.template.navigateToTriageAgent";

/**
 * Will send tool output directly to the model without any additions
 */
const DEFAULT_EXECUTE_MESSAGE = "";

/**
 * Configuration parameters for creating a navigation handler to a triage agent.
 * Defines optional messages or functions to handle flush, execution, and tool output scenarios during navigation.
 *
 * @interface INavigateToTriageParams
 * @property {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [flushMessage] - Optional message or function to emit after flushing the session. If a function, it receives the client ID and default agent name, returning a string or promise of a string.
 * @property {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [executeMessage] - Optional message or function to execute when no navigation is needed. If a function, it receives the client ID and default agent name, returning a string or promise of a string.
 * @property {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [toolOutputAccept] - Optional message or function for tool output when navigation to the default agent occurs. If a function, it receives the client ID and default agent name, returning a string or promise of a string. Defaults to a message indicating successful navigation.
 * @property {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [toolOutputReject] - Optional message or function for tool output when already on the default agent. If a function, it receives the client ID and default agent name, returning a string or promise of a string. Defaults to a message indicating no navigation was needed.
 *
 * @example
 * // Static message configuration
 * const params: INavigateToTriageParams = {
 *   flushMessage: "Session reset for triage.",
 *   toolOutputAccept: "Navigation completed.",
 * };
 *
 * @example
 * // Dynamic message configuration
 * const params: INavigateToTriageParams = {
 *   executeMessage: (clientId, agent) => `Processing ${clientId} on ${agent}`,
 *   toolOutputReject: (clientId, agent) => `No navigation needed for ${clientId}`,
 * };
 */
export interface INavigateToTriageParams {
  /**
   * Optional callback function executed before navigation begins.
   * Allows for custom pre-navigation logic and validation before changing to the default agent.
   */
  beforeNavigate?: (
    clientId: string,
    lastMessage: string | null,
    lastAgent: AgentName,
    defaultAgent: AgentName,
  ) => Promise<void> | void;
  /**
   * Optional function to transform the last user message for navigation context.
   * Customizes how the previous message is processed when navigating to the triage agent.
   */
  lastMessage?: (
    clientId: string,
    lastMessage: string | null,
    defaultAgent: AgentName,
    lastAgent: AgentName,
  ) => string | Promise<string>;
  /**
   * Optional message or function to emit after flushing the session.
   * Used when navigation cannot be completed and the session needs to be reset.
   */
  flushMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  /**
   * Optional message or function to execute when no navigation is needed.
   * Used when already on the default agent and execution should continue.
   */
  executeMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  /**
   * Optional message or function for tool output when navigation to the default agent occurs.
   * Provides feedback when successful navigation to the triage agent happens.
   */
  toolOutputAccept?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  /**
   * Optional message or function for tool output when already on the default agent.
   * Used to inform the user that no navigation was needed since they're already on the target agent.
   */
  toolOutputReject?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
}

const DEFAULT_ACCEPT_FN = (_: SessionId, defaultAgent: AgentName) =>
  `Successfully navigated to ${defaultAgent}. Continue conversation based on the last message.`;
const DEFAULT_REJECT_FN = (_: SessionId, defaultAgent: AgentName) =>
  `Already on ${defaultAgent}. No navigation needed. Continue conversation.`;
const DEFAULT_LAST_MESSAGE_FN = (
  _: SessionId,
  lastMessage: string,
  defaultAgent: AgentName,
) =>
  `User changed conversation topic. The next message recieved: ${lastMessage}.  Continue conversation based on the last message without navigating to ${defaultAgent}.`;

/**
 * Creates a function to navigate to a triage agent for a specific client, handling navigation, message execution, and tool output.
 * The factory generates a handler that checks navigation state, commits tool outputs with accept/reject messages, and triggers execution or emission based on provided parameters.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the navigation operation if logging is enabled in the global configuration.
 *
 * @param {INavigateToTriageParams} params - Configuration parameters for the navigation handler.
 * @param {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [params.flushMessage] - Optional message or function to emit after flushing the session.
 * @param {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [params.executeMessage] - Optional message or function to execute if no navigation is needed.
 * @param {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [params.toolOutputAccept] - Optional message or function for tool output when navigation occurs, defaults to `DEFAULT_ACCEPT_FN`.
 * @param {string | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>)} [params.toolOutputReject] - Optional message or function for tool output when already on the default agent, defaults to `DEFAULT_REJECT_FN`.
 * @returns {Promise<(toolId: string, clientId: string) => Promise<void>>} A promise resolving to a function that handles navigation to the triage agent.
 * @throws {Error} If neither `flushMessage` nor `executeMessage` is provided, or if any internal operation (e.g., navigation, commit, or execution) fails.
 *
 * @example
 * // Create a navigation handler with a static flush message
 * const navigate = await createNavigateToTriageAgent({
 *   flushMessage: "Session reset for triage.",
 *   toolOutputAccept: "Navigation completed.",
 * });
 * await navigate("tool-123", "client-456");
 * // Navigates to default agent, commits custom tool output, and emits the flush message if applicable.
 *
 * @example
 * // Create a navigation handler with dynamic messages
 * const navigate = await createNavigateToTriageAgent({
 *   executeMessage: (clientId, agent) => `Processing ${clientId} on ${agent}`,
 *   toolOutputReject: (clientId, agent) => `No navigation needed for ${clientId}`,
 * });
 * await navigate("tool-789", "client-012");
 * // Commits dynamic reject message and executes the message if already on the default agent.
 */
export const createNavigateToTriageAgent = ({
  flushMessage,
  beforeNavigate,
  lastMessage: lastMessageFn = DEFAULT_LAST_MESSAGE_FN,
  executeMessage = DEFAULT_EXECUTE_MESSAGE,
  toolOutputAccept = DEFAULT_ACCEPT_FN,
  toolOutputReject = DEFAULT_REJECT_FN,
}: INavigateToTriageParams) => {
  /**
   * Navigates to the default triage agent for a given client and tool, handling message commits and execution.
   *
   * @param {string} toolId - The identifier of the tool triggering the navigation.
   * @param {string} clientId - The unique identifier of the client session.
   * @returns {Promise<void>} A promise that resolves when the navigation and associated actions are complete.
   * @throws {Error} If navigation, commit, or execution operations fail (e.g., invalid clientId or swarm configuration).
   */
  return beginContext(async (toolId: string, clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        toolId,
      });

    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    const { defaultAgent } = swarm.swarmSchemaService.get(swarmName);

    const lastAgent = await getAgentName(clientId);

    await commitStopToolsForce(clientId);

    if (await not(hasNavigation(clientId, defaultAgent))) {
      const lastMessageRaw = await getLastUserMessage(clientId);
      const lastMessage = await lastMessageFn(clientId, lastMessageRaw, defaultAgent, lastAgent);
      beforeNavigate && await beforeNavigate(clientId, lastMessage, lastAgent, defaultAgent);
      await commitToolOutputForce(
        toolId,
        typeof toolOutputAccept === "string"
          ? toolOutputAccept
          : await toolOutputAccept(clientId, lastAgent),
        clientId
      );
      await changeToDefaultAgent(clientId);
      await executeForce(
        lastMessage,
        clientId
      );
      return;
    }

    if (flushMessage) {
      await commitFlushForce(clientId);
      await emitForce(
        typeof flushMessage === "string"
          ? flushMessage
          : await flushMessage(clientId, defaultAgent),
        clientId
      );
      return;
    }

    await commitToolOutputForce(
      toolId,
      typeof toolOutputReject === "string"
        ? toolOutputReject
        : await toolOutputReject(clientId, defaultAgent),
      clientId
    );
    await executeForce(
      typeof executeMessage === "string"
        ? executeMessage
        : await executeMessage(clientId, defaultAgent),
      clientId
    );
  });
};
