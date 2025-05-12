import { memoize, queued, singleshot } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";
import beginContext from "../../utils/beginContext";
import { disposeSubject } from "../../config/emitters";

const METHOD_NAME = "function.navigate.changeToAgent";

/**
 * Type definition for the change agent execution function.
 * @typedef {Function} TChangeToAgentRun
 * @param {string} methodName - The name of the method invoking the change.
 * @param {string} agentName - The name of the agent to switch to.
 * @param {SwarmName} swarmName - The name of the swarm in which the change occurs.
 * @returns {Promise<boolean>} A promise that resolves when the agent change is complete.
 */
type TChangeToAgentRun = (
  methodName: string,
  agentName: string,
  swarmName: SwarmName
) => Promise<boolean>;

/**
 * Creates a change agent function with time-to-live (TTL) and queuing capabilities.
 *
 * This factory function generates a queued, TTL-limited function to handle agent changes for a specific client session,
 * ensuring operations are executed sequentially and cached results are reused within the TTL period.
 *
 * @function
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {TChangeToAgentRun} A function that performs the agent change operation with queuing and TTL.
 */
const createChangeToAgent = memoize(
  ([clientId]) => `${clientId}`,
  (clientId: string) =>
    queued(
      async (
        methodName: string,
        agentName: AgentName,
        swarmName: SwarmName
      ) => {
        if (
          !swarm.navigationValidationService.shouldNavigate(
            agentName,
            clientId,
            swarmName
          )
        ) {
          console.warn(`function "changeToAgent" skipped due to the circular route found clientId=${clientId} swarmName=${swarmName} agentNameTo=${agentName}`);
          return false;
        }
        // Notify all agents in the swarm of the change
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
          // Dispose of the current agent's resources and set up the new agent
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
        // Set the new agent as the active agent
        await swarm.swarmPublicService.setAgentName(
          agentName,
          methodName,
          clientId,
          swarmName
        );
        return true;
      }
    ) as TChangeToAgentRun,
);

/**
 * Creates a garbage collector for the change agent function.
 *
 * This function sets up a singleton interval-based garbage collector to periodically clean up expired TTL entries from `createChangeToAgent`.
 *
 * @function
 * @returns {Promise<void>} A promise that resolves when the garbage collector is initialized.
 */
const createGc = singleshot(async () => {
  disposeSubject.subscribe((clientId) => {
    createChangeToAgent.clear(clientId);
  });
});

/**
 * Function implementation
 */
const changeToAgentInternal = beginContext(
  async (agentName: AgentName, clientId: string) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        agentName,
        clientId,
      });

    const swarmName = swarm.sessionValidationService.getSwarm(clientId);
    {
      // Validate session, agent, and dependencies
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

    if (!swarm.swarmValidationService.getAgentSet(swarmName).has(agentName)) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(
          'function "changeToAgent" skipped due to the agent is not in the swarm',
          {
            agentName,
            clientId,
            swarmName,
          }
        );
      console.warn(`function "changeToAgent" skipped due to the agent is not in the swarm clientId=${clientId} agentName=${agentName} swarmName=${swarmName}`);
      return false;
    }

    // Execute the agent change with TTL and queuing
    const run = await createChangeToAgent(clientId);
    createGc();
    return await run(METHOD_NAME, agentName, swarmName);
  }
);

/**
 * Changes the active agent for a given client session in a swarm.
 *
 * This function facilitates switching the active agent in a swarm session, validating the session and agent dependencies,
 * logging the operation if enabled, and executing the change using a TTL-limited, queued runner.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.
 *
 * @param {AgentName} agentName - The name of the agent to switch to.
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {Promise<boolean>} A promise that resolves when the agent change is complete. If it resolved false, the navigation is canceled due to recursion
 * @throws {Error} If session or agent validation fails, or if the agent change process encounters an error.
 * @example
 * await changeToAgent("AgentX", "client-123");
 */
export function changeToAgent(agentName: AgentName, clientId: string) {
  return changeToAgentInternal(agentName, clientId)
}
