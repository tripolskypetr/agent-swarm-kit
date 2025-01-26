import { queued, singleshot, ttl } from "functools-kit";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";

/**
 * Type definition for the complete run function.
 * @typedef {function(string): Promise<string>} TCompleteRun
 */
type TCompleteRun = (content: string) => Promise<string>;

const COMPLETE_TTL = 15 * 60 * 1_000;
const COMPLETE_GC = 60 * 1_000;

/**
 * Creates a complete function with TTL and queuing.
 * @param {string} clientId - The client ID.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {TCompleteRun} The complete run function.
 */
const createComplete = ttl(
  (clientId: string, swarmName: SwarmName) =>
    queued(async (content: string) => {
      swarm.swarmValidationService.validate(swarmName, "complete");
      swarm.sessionValidationService.addSession(clientId, swarmName, "complete");
      const result = await swarm.sessionPublicService.execute(
        content,
        clientId,
        swarmName
      );
      await disposeConnection(clientId, swarmName);
      return result;
    }) as TCompleteRun,
  {
    key: ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    timeout: COMPLETE_TTL,
  }
);

/**
 * Creates a garbage collector for the complete function.
 * @returns {Promise<void>} A promise that resolves when the GC is set up.
 */
const createGc = singleshot(async () => {
  setInterval(createComplete.gc, COMPLETE_GC);
});

/**
 * The complete function will create a swarm, execute single command and dispose it
 * Best for developer needs like troubleshooting tool execution
 * 
 * @param {string} content - The content to process.
 * @param {string} clientId - The client ID.
 * @param {SwarmName} swarmName - The swarm name.
 * @returns {Promise<string>} The result of the complete function.
 */
export const complete = async (
  content: string,
  clientId: string,
  swarmName: SwarmName
) => {
  swarm.loggerService.log("function complete", {
    content,
    clientId,
    swarmName,
  });
  const run = await createComplete(clientId, swarmName);
  createGc();
  return await run(content);
};
