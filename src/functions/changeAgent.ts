import { queued, singleshot, ttl } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

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

type TChangeAgentRun = (methodName: string, agentName: string) => Promise<void>;

/**
 * Creates a change agent function with TTL and queuing.
 * @function
 * @param {string} clientId - The client ID.
 * @returns {TChangeAgentRun} - The change agent function.
 */
const createChangeAgent = ttl(
  (clientId: string) =>
    queued(async (methodName: string, agentName: AgentName) => {
      swarm.sessionValidationService.validate(clientId, "changeAgent");
      swarm.agentValidationService.validate(agentName, "changeAgent");
      const swarmName = swarm.sessionValidationService.getSwarm(clientId);
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
    }) as TChangeAgentRun,
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
  setInterval(createChangeAgent.gc, CHANGE_AGENT_GC);
});

/**
 * Changes the agent for a given client session in swarm.
 * @async
 * @function
 * @param {AgentName} agentName - The name of the agent.
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
export const changeAgent = async (agentName: AgentName, clientId: string) => {
  const methodName = "function changeAgent";
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function changeAgent", {
      agentName,
      clientId,
    });
  const run = await createChangeAgent(clientId);
  createGc();
  return await run(methodName, agentName);
};
