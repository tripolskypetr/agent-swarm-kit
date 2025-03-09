import swarm from "../lib";
import { IState, IStateData, StateName } from "../interfaces/State.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "src/utils/beginContext";

type TSharedState = {
  [key in keyof IState]: unknown;
};

const METHOD_NAME_GET = "SharedStateUtils.getSharedState";
const METHOD_NAME_SET = "SharedStateUtils.setSharedState";
const METHOD_NAME_CLEAR = "SharedStateUtils.clearSharedState";

/**
 * Utility class for managing state in the agent swarm.
 * @implements {TSharedState}
 */
export class SharedStateUtils implements TSharedState {
  /**
   * Retrieves the state for a given client and state name.
   * @template T
   * @param {Object} payload - The payload containing client and state information.
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<T>} The state data.
   * @throws Will throw an error if the state is not registered in the agent.
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
   * Sets the state for a given client and state name.
   * @template T
   * @param {T | ((prevSharedState: T) => Promise<T>)} dispatchFn - The new state or a function that returns the new state.
   * @param {StateName} stateName - The state name.
   * @returns {Promise<void>}
   * @throws Will throw an error if the state is not registered in the agent.
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
   * Set the state to initial value
   * @template T
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<void>}
   * @throws Will throw an error if the state is not registered in the agent.
   */
  public clearState = beginContext(async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_SET, {
        stateName,
      });
    return await swarm.sharedStatePublicService.clearState(
      METHOD_NAME_CLEAR,
      stateName
    );
  }) as <T extends unknown = any>(stateName: StateName) => Promise<T>;
}

/**
 * Instance of SharedStateUtils for managing state.
 * @type {SharedStateUtils}
 */
export const SharedState = new SharedStateUtils();

export default SharedState;
