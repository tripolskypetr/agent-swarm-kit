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

const METHOD_NAME = "function.template.navigateToAgent";

interface IFactoryParams {
  flushMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  toolOutput?:
    | string
    | ((clientId: string, agentName: AgentName) => string | Promise<string>);
  emitMessage?:
    | string
    | ((clientId: string, lastMessage: string, agentName: AgentName) => string | Promise<string>);
  executeMessage?:
    | string
    | ((clientId: string, lastMessage: string, agentName: AgentName) => string | Promise<string>);
}

const DEFAULT_TOOL_OUTPUT = (_: SessionId, agentName: AgentName) =>
  `Successfully navigated to ${agentName}`;
const DEFAULT_FLUSH_MESSAGE = ({}: SessionId, {}: AgentName) =>
  `Sorry, I missed that. Could you repeat please`;

export const createNavigateToAgent = async ({
  executeMessage,
  emitMessage,
  flushMessage = DEFAULT_FLUSH_MESSAGE,
  toolOutput = DEFAULT_TOOL_OUTPUT,
}: IFactoryParams) => {

  if (!emitMessage && !executeMessage) {
    throw new Error(
      "agent-swarm createNavigateToAgent emitMessage or executeMessage required"
    );
  }

  return beginContext(
    async (toolId: string, clientId: string, agentName: AgentName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
        });

      const lastMessage = await getLastUserMessage(clientId);

      if (
        await and(
          not(hasNavigation(clientId, agentName)),
          Promise.resolve(!!executeMessage)
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
            : await executeMessage(clientId, lastMessage, agentName),
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
            : await emitMessage(clientId, lastMessage, agentName),
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
