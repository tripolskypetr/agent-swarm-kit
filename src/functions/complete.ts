import { queued, singleshot, ttl } from "functools-kit";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import { disposeConnection } from "./disposeConnection";

type TCompleteRun = (content: string) => Promise<string>;

const COMPLETE_TTL = 15 * 60 * 1_000;
const COMPLETE_GC = 60 * 1_000;

const createComplete = ttl(
  (clientId: string, swarmName: SwarmName) =>
    queued(async (content: string) => {
      swarm.swarmValidationService.validate(swarmName);
      swarm.sessionValidationService.addSession(clientId, swarmName);
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

const createGc = singleshot(async () => {
  setInterval(createComplete.gc, COMPLETE_GC);
});

export const complete = async (
  content: string,
  clientId: string,
  swarmName: SwarmName
) => {
  const run = await createComplete(clientId, swarmName);
  createGc();
  return await run(content);
};
