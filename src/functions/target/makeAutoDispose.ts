import { Source } from "functools-kit";
import { SwarmName } from "../../interfaces/Swarm.interface";
import { disposeConnection } from "./disposeConnection";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.target.makeAutoDispose";

/**
 * Default timeout in seconds before auto-dispose is triggered.
 * @constant {number}
 */
const DEFAULT_TIMEOUT = 15 * 60;

/**
 * Interface for the parameters of the makeAutoDispose function.
 */
export interface IMakeDisposeParams {
  timeoutSeconds: number;
  /**
   * Optional callback invoked when the session is closed.
   * Called after the auto-dispose mechanism triggers and the session is successfully disposed.
   */
  onDestroy?: (clientId: string, swarmName: SwarmName) => void;
}

/**
 * Creates an auto-dispose mechanism for a client session in a swarm.
 *
 * This function establishes a timer-based auto-dispose system that monitors client activity in a swarm session. If no activity
 * is detected (via the `tick` method) within the specified timeout period, the session is automatically disposed using `disposeConnection`.
 * The mechanism uses a `Source` from `functools-kit` to manage the timer, which can be reset or stopped manually. The execution is wrapped
 * in `beginContext` for a clean environment, and an optional callback (`onDestroy`) can be provided to handle post-disposal actions.
 *
 * @throws {Error} If disposal via `disposeConnection` fails when triggered automatically.
 * @example
 * const { tick, destroy } = makeAutoDispose("client-123", "TaskSwarm", { 
 *   timeoutSeconds: 30, 
 *   onDestroy: (id, name) => console.log(`Session ${id} in ${name} closed`) 
 * });
 * tick(); // Reset timer
 * setInterval(tick, 10000); // Keep alive every 10 seconds
 * destroy(); // Stop manually
 */
export const makeAutoDispose = beginContext(
  (
    clientId: string,
    swarmName: SwarmName,
    {
      timeoutSeconds = DEFAULT_TIMEOUT,
      onDestroy,
    }: Partial<IMakeDisposeParams> = {}
  ) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        swarmName,
      });

    let isOk = true;

    // Set up a timer using Source to track inactivity
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
      tick() {
        isOk = true;
      },
      destroy() {
        unSource();
        onDestroy && onDestroy(clientId, swarmName);
      },
    };
  }
);
