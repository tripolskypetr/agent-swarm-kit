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

const METHOD_NAME = "function.template.navigateToTriageAgent";

interface IFactoryParams {
  flushMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  executeMessage?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  toolOutputAccept?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
  toolOutputReject?:
    | string
    | ((clientId: string, defaultAgent: AgentName) => string | Promise<string>);
}

const DEFAULT_ACCEPT_FN = (_: SessionId, defaultAgent: AgentName) =>
  `Successfully navigated to ${defaultAgent}`;
const DEFAULT_REJECT_FN = (_: SessionId, defaultAgent: AgentName) =>
  `Already on ${defaultAgent}`;

export const createNavigateToTriageAgent = beginContext(
  async ({
    flushMessage,
    executeMessage,
    toolOutputAccept = DEFAULT_ACCEPT_FN,
    toolOutputReject = DEFAULT_REJECT_FN,
  }: IFactoryParams) => {
    if (!flushMessage && !executeMessage) {
      throw new Error(
        "agent-swarm createNavigateToTriageAgent flushMessage or executeMessage required"
      );
    }

    return async (toolId: string, clientId: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME, {
          clientId,
          toolId,
        });

      const swarmName = swarm.sessionValidationService.getSwarm(clientId);
      const { defaultAgent } = swarm.swarmSchemaService.get(swarmName);

      if (await not(hasNavigation(clientId, defaultAgent))) {
        const lastMessage = await getLastUserMessage(clientId);
        await changeToDefaultAgent(clientId);
        await commitToolOutputForce(
          toolId,
          typeof toolOutputAccept === "string"
            ? toolOutputAccept
            : await toolOutputAccept(clientId, defaultAgent),
          clientId
        );
        await executeForce(lastMessage, clientId);
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
    };
  }
);
