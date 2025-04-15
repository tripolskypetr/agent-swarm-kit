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

const METHOD_NAME = "function.template.navigateToTriageAgent";

interface IFactoryParams {
  flushMessage?: string | ((clientId: string) => string | Promise<string>);
  executeMessage?: string | ((clientId: string) => string | Promise<string>);
}

export const createNavigateToTriageAgent = beginContext(
  async ({ flushMessage, executeMessage }: IFactoryParams) => {
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
          `Successfully navigated to ${defaultAgent}`,
          clientId
        );
        await executeForce(lastMessage, clientId);
      }

      if (flushMessage) {
        await commitFlushForce(clientId);
        await emitForce(
          typeof flushMessage === "string"
            ? flushMessage
            : await flushMessage(clientId),
          clientId
        );
        return;
      }

      await commitToolOutputForce(
        toolId,
        `Already on ${defaultAgent}`,
        clientId
      );
      await executeForce(
        typeof executeMessage === "string"
          ? executeMessage
          : await executeMessage(clientId),
        clientId
      );
    };
  }
);
