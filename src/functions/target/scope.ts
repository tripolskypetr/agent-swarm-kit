import { AgentName } from "../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import beginContext from "../../utils/beginContext";
import { SwarmName } from "../../interfaces/Swarm.interface";
import { disposeConnection } from "./disposeConnection";

const METHOD_NAME = "function.target.scope";

interface IScopeOptions {
  clientId: string;
  swarmName: SwarmName;
  onError?: (error: Error) => void;
}

export const scope = beginContext(
  async <T = any>(
    runFn: (clientId: string, agentName: AgentName) => Promise<T | void>,
    { clientId, swarmName, onError }: IScopeOptions
  ): Promise<T | void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        swarmName,
      });

    if (swarm.sessionValidationService.hasSession(clientId)) {
      throw new Error(
        `agent-swarm scope Session already exists for clientId=${clientId}`
      );
    }

    swarm.sessionValidationService.addSession(clientId, swarmName, "scope");

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);

    const agentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );

    let result: T = null;

    try {
      result = (await runFn(clientId, agentName)) as T;
    } catch (error) {
      console.error(`agent-swarm scope error for clientId=${clientId}`, error);
      onError && onError(error as Error);
    } finally {
      await disposeConnection(clientId, swarmName, METHOD_NAME);
    }

    return result;
  }
) as <T = any>(
  runFn: (clientId: string, agentName: AgentName) => Promise<T | void>,
  options: IScopeOptions
) => Promise<T | void>;
