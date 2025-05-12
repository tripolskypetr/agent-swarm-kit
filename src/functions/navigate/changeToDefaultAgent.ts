import { memoize, queued, singleshot } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";
import beginContext from "../../utils/beginContext";
import { disposeSubject } from "../../config/emitters";

const METHOD_NAME = "function.navigate.changeToDefaultAgent";

/**
 * Type definition for the default agent change execution function.
 * @typedef {Function} TChangeToDefaultAgentRun
 * @param {string} methodName - The name of the method invoking the change.
 * @param {string} agentName - The name of the default agent to switch to.
 * @param {SwarmName} swarmName - The name of the swarm in which the change occurs.
 * @returns {Promise<boolean>} A promise that resolves when the agent change is complete.
 */
type TChangeToDefaultAgentRun = (
  methodName: string,
  agentName: string,
  swarmName: SwarmName
) => Promise<boolean>;

/**
 * Creates a change agent function with time-to-live (TTL) and queuing capabilities for switching to the default agent.
 *
 * This factory function generates a queued, TTL-limited function to handle agent changes to the default agent for a specific client session,
 * ensuring operations are executed sequentially and cached results are reused within the TTL period.
 *
 * @function
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {TChangeToDefaultAgentRun} A function that performs the default agent change operation with queuing and TTL.
 */
const createChangeToDefaultAgent = memoize(
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
          // Dispose of the current agent's resources and set up the new default agent
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
        // Set the default agent as the active agent
        await swarm.swarmPublicService.setAgentName(
          agentName,
          methodName,
          clientId,
          swarmName
        );

        return true;
      }
    ) as TChangeToDefaultAgentRun
);

/**
 * Creates a garbage collector for the change agent function.
 *
 * This function sets up a singleton interval-based garbage collector to periodically clean up expired TTL entries from `createChangeToDefaultAgent`.
 *
 * @function
 * @returns {Promise<void>} A promise that resolves when the garbage collector is initialized.
 */
const createGc = singleshot(async () => {
  disposeSubject.subscribe((clientId) => {
    createChangeToDefaultAgent.clear(clientId);
  });
});

/**
 * Function implementation
 */
const changeToDefaultAgentInternal = beginContext(async (clientId: string) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  const { defaultAgent: agentName } = swarm.swarmSchemaService.get(swarmName);
  {
    // Validate session and default agent
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
  }

  // Execute the agent change with TTL and queuing
  const run = await createChangeToDefaultAgent(clientId);
  createGc();
  return await run(METHOD_NAME, agentName, swarmName);
});

/**
 * Navigates back to the default agent for a given client session in a swarm.
 *
 * This function switches the active agent to the default agent defined in the swarm schema for the specified client session.
 * It validates the session and default agent, logs the operation if enabled, and executes the change using a TTL-limited, queued runner.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @returns {Promise<boolean>} A promise that resolves when the default agent change is complete. If navigation stack contains recursion being canceled
 * @throws {Error} If session or agent validation fails, or if the agent change process encounters an error.
 * @example
 * await changeToDefaultAgent("client-123");
 */
export async function changeToDefaultAgent(clientId: string) {
  return await changeToDefaultAgentInternal(clientId);
}
