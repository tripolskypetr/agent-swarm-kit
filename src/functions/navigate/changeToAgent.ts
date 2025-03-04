import { queued, singleshot, ttl } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";

const METHOD_NAME = "function.changeToAgent";

/**
 * Time-to-live for the change agent function in milliseconds.
 * @constant {number}
 */
const CHANGE_AGENT_TTL = 15 * 60 * 1_000;

/**
 * Garbage collection interval for the change agent function in milliseconds.
 * @constant {number}
 */
const CHANGE_AGENT_GC = 60 * 1_000;

type TChangeToAgentRun = (methodName: string, agentName: string, swarmName: SwarmName) => Promise<void>;

/**
 * Creates a change agent function with TTL and queuing.
 * @function
 * @param {string} clientId - The client ID.
 * @returns {TChangeToAgentRun} - The change agent function.
 */
const createChangeToAgent = ttl(
  (clientId: string) =>
    queued(async (methodName: string, agentName: AgentName, swarmName: SwarmName) => {
      await Promise.all(
        swarm.swarmValidationService
          .getAgentList(swarmName)
          .map(async (agentName) => {
            await swarm.agentPublicService.commitAgentChange(
              methodName,
              clientId,
              agentName
            );
          })
      );
      {
        const agentName = await swarm.swarmPublicService.getAgentName(METHOD_NAME, clientId, swarmName);
        await swarm.agentPublicService.dispose(methodName, clientId, agentName);
        await swarm.historyPublicService.dispose(
          methodName,
          clientId,
          agentName
        );
        await swarm.swarmPublicService.setAgentRef(
          methodName,
          clientId,
          swarmName,
          agentName,
          await swarm.agentPublicService.createAgentRef(
            methodName,
            clientId,
            agentName
          )
        );
      }
      await swarm.swarmPublicService.setAgentName(
        agentName,
        methodName,
        clientId,
        swarmName
      );
    }) as TChangeToAgentRun,
  {
    key: ([clientId]) => `${clientId}`,
    timeout: CHANGE_AGENT_TTL,
  }
);

/**
 * Creates a garbage collector for the change agent function.
 * @function
 * @returns {Promise<void>} - A promise that resolves when the garbage collector is created.
 */
const createGc = singleshot(async () => {
  setInterval(createChangeToAgent.gc, CHANGE_AGENT_GC);
});

/**
 * Changes the agent for a given client session in swarm.
 * @async
 * @function
 * @param {AgentName} agentName - The name of the agent.
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
export const changeToAgent = async (agentName: AgentName, clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      agentName,
      clientId,
    });
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  {
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    const activeAgent = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );
    if (!swarm.agentValidationService.hasDependency(activeAgent, agentName)) {
      console.error(
        `agent-swarm missing dependency detected for activeAgent=${activeAgent} dependencyAgent=${agentName}`
      );
    }
  }
  const run = await createChangeToAgent(clientId);
  createGc();
  return await run(METHOD_NAME, agentName, swarmName);
};
