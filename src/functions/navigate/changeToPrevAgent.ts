import { memoize, queued, singleshot } from "functools-kit";
import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";
import beginContext from "../../utils/beginContext";
import { disposeSubject } from "../../config/emitters";

const METHOD_NAME = "function.navigate.changeToPrevAgent";

/**
 * Type definition for the previous agent change execution function.
 */
type TChangeToPrevAgentRun = (
  methodName: string,
  agentName: string,
  swarmName: SwarmName
) => Promise<boolean>;

/**
 * Creates a change agent function with time-to-live (TTL) and queuing capabilities for switching to the previous agent.
 *
 * This factory function generates a queued, TTL-limited function to handle agent changes to the previous or default agent for a specific client session,
 * ensuring operations are executed sequentially and cached results are reused within the TTL period.
 *
 * @function
 */
const createChangeToPrevAgent = memoize(
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
        // Set the previous or default agent as the active agent
        await swarm.swarmPublicService.setAgentName(
          agentName,
          methodName,
          clientId,
          swarmName
        );

        return true;
      }
    ) as TChangeToPrevAgentRun
);

/**
 * Creates a garbage collector for the change agent function.
 *
 * This function sets up a singleton interval-based garbage collector to periodically clean up expired TTL entries from `createChangeToPrevAgent`.
 *
 * @function
 */
const createGc = singleshot(async () => {
  disposeSubject.subscribe((clientId) => {
    createChangeToPrevAgent.clear(clientId);
  });
});

/**
 * Function implementation
 */
const changeToPrevAgentInternal = beginContext(async (clientId: string) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  const agentName = await swarm.swarmPublicService.navigationPop(
    METHOD_NAME,
    clientId,
    swarmName
  );
  {
    // Validate session and the retrieved agent
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
  }

  // Execute the agent change with TTL and queuing
  const run = await createChangeToPrevAgent(clientId);
  createGc();
  return await run(METHOD_NAME, agentName, swarmName);
});

/**
 * Navigates back to the previous or default agent for a given client session in a swarm.
 *
 * This function switches the active agent to the previous agent in the navigation stack, or the default agent if no previous agent exists,
 * as determined by the `navigationPop` method. It validates the session and agent, logs the operation if enabled, and executes the change using a TTL-limited, queued runner.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts.
 *
 * @throws {Error} If session or agent validation fails, or if the agent change process encounters an error.
 * @example
 * await changeToPrevAgent("client-123");
 */
export async function changeToPrevAgent(clientId: string) {
  return await changeToPrevAgentInternal(clientId);
}
