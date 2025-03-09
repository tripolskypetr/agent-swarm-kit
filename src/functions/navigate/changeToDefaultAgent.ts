import { queued, singleshot, ttl } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";
import beginContext from "src/utils/beginContext";

const METHOD_NAME = "function.navigate.changeToDefaultAgent";

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
type TChangeToDefaultAgentRun = (
  methodName: string,
  agentName: string,
  swarmName: SwarmName
) => Promise<void>;

/**
 * Creates a change agent function with TTL and queuing.
 * @function
 * @param {string} clientId - The client ID.
 * @returns {TChangeToDefaultAgentRun} - The change agent function.
 */
const createChangeToDefaultAgent = ttl(
  (clientId: string) =>
    queued(
      async (
        methodName: string,
        agentName: AgentName,
        swarmName: SwarmName
      ) => {
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
          const agentName = await swarm.swarmPublicService.getAgentName(
            METHOD_NAME,
            clientId,
            swarmName
          );
          await swarm.agentPublicService.dispose(
            methodName,
            clientId,
            agentName
          );
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
      }
    ) as TChangeToDefaultAgentRun,
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
  setInterval(createChangeToDefaultAgent.gc, CHANGE_AGENT_GC);
});

/**
 * Navigates back to the default agent
 * @async
 * @function
 * @param {string} clientId - The client ID.
 * @returns {Promise<void>} - A promise that resolves when the agent is changed.
 */
export const changeToDefaultAgent = beginContext(async (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  const { defaultAgent: agentName } = swarm.swarmSchemaService.get(swarmName);
  {
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
  }
  const run = await createChangeToDefaultAgent(clientId);
  createGc();
  return await run(METHOD_NAME, agentName, swarmName);
});
