import swarm from "../lib";
import { IState, IStateData, StateName } from "../interfaces/State.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "../utils/beginContext";

/**
 * Type definition for a shared state object, mapping IState keys to unknown values.
 * Used for type-safe shared state access across multiple clients.
*/
type TSharedState = {
  [key in keyof IState]: unknown;
};

/** @private Constant for logging the getState method in SharedStateUtils*/
const METHOD_NAME_GET = "SharedStateUtils.getSharedState";

/** @private Constant for logging the setState method in SharedStateUtils*/
const METHOD_NAME_SET = "SharedStateUtils.setSharedState";

/** @private Constant for logging the clearState method in SharedStateUtils*/
const METHOD_NAME_CLEAR = "SharedStateUtils.clearSharedState";

/**
 * Utility class for managing shared state within an agent swarm.
 * Provides methods to get, set, and clear state data for specific state names, interfacing with the swarm's shared state service.
 * @implements {TSharedState}
*/
export class SharedStateUtils implements TSharedState {
  /**
   * Retrieves the shared state data for a given state name.
   * Executes within a context for logging and delegates to the shared state service.
   * @template T - The type of the state data to retrieve, defaults to any.
   * @throws {Error} If the state name is not registered in the agent or the shared state service encounters an error.
  */
  public getState = beginContext(async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_GET, {
        stateName,
      });
    return await swarm.sharedStatePublicService.getState(
      METHOD_NAME_GET,
      stateName
    );
  }) as <T extends unknown = any>(stateName: StateName) => Promise<T>;

  /**
   * Sets the shared state data for a given state name.
   * Accepts either a direct value or a function that computes the new state based on the previous state.
   * Executes within a context for logging and delegates to the shared state service.
   * @template T - The type of the state data to set, defaults to any.
   * @throws {Error} If the state name is not registered in the agent or the shared state service encounters an error.
  */
  public setState = beginContext(
    async (
      dispatchFn:
        | IStateData
        | ((prevSharedState: IStateData) => Promise<IStateData>),
      stateName: StateName
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_SET, {
          stateName,
        });
      if (typeof dispatchFn === "function") {
        return await swarm.sharedStatePublicService.setState(
          dispatchFn as (prevSharedState: IStateData) => Promise<IStateData>,
          METHOD_NAME_SET,
          stateName
        );
      }
      return await swarm.sharedStatePublicService.setState(
        async () => dispatchFn,
        METHOD_NAME_SET,
        stateName
      );
    }
  ) as <T extends unknown = any>(
    dispatchFn: T | ((prevSharedState: T) => Promise<T>),
    stateName: StateName
  ) => Promise<void>;

  /**
   * Clears the shared state for a given state name, resetting it to its initial value.
   * Executes within a context for logging and delegates to the shared state service.
   * @template T - The type of the state data, defaults to any (unused in return).
   * @throws {Error} If the state name is not registered in the agent or the shared state service encounters an error.
  */
  public clearState = beginContext(async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CLEAR, {
        stateName,
      });
    return await swarm.sharedStatePublicService.clearState(
      METHOD_NAME_CLEAR,
      stateName
    );
  }) as <T extends unknown = any>(stateName: StateName) => Promise<T>;
}

/**
 * Singleton instance of SharedStateUtils for managing shared state operations.
*/
export const SharedState = new SharedStateUtils();

export default SharedState;
