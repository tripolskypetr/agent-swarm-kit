import { Source } from "functools-kit";
import { SwarmName } from "../../interfaces/Swarm.interface";
import { disposeConnection } from "./disposeConnection";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.makeAutoDispose";

const DEFAULT_TIMEOUT = 15 * 60;

/**
 * Interface for the parameters of the makeAutoDispose function.
 */
export interface IMakeDisposeParams {
  /**
   * Timeout in seconds before auto-dispose is triggered.
   */
  timeoutSeconds: number;
  /**
   * Callback when session is closed
   */
  onDestroy?: (clientId: string, swarmName: SwarmName) => void;
}

/**
 * Creates an auto-dispose mechanism for a client in a swarm.
 *
 * @param {string} clientId - The ID of the client.
 * @param {SwarmName} swarmName - The name of the swarm.
 * @param {Partial<IMakeDisposeParams>} [params={}] - Optional parameters for auto-dispose.
 * @returns {Object} An object with tick and stop methods to control the auto-dispose.
 */
export const makeAutoDispose = (
  clientId: string,
  swarmName: SwarmName,
  {
    timeoutSeconds = DEFAULT_TIMEOUT,
    onDestroy,
  }: Partial<IMakeDisposeParams> = {}
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      swarmName,
    });

  let isOk = true;

  const unSource = Source.fromInterval(1_000)
    .reduce((acm) => {
      if (isOk) {
        isOk = false;
        return 0;
      }
      return acm + 1;
    }, 0)
    .filter((ticker) => ticker >= timeoutSeconds)
    .once(async () => {
      unSource();
      if (swarm.sessionValidationService.hasSession(clientId)) {
        await disposeConnection(clientId, swarmName);
      }
      onDestroy && onDestroy(clientId, swarmName);
    });

  return {
    /**
     * Signals that the client is active, resetting the auto-dispose timer.
     */
    tick() {
      isOk = true;
    },
    /**
     * Stops the auto-dispose mechanism.
     */
    destroy() {
      unSource();
      onDestroy && onDestroy(clientId, swarmName);
    },
  };
};
