import swarm from "../lib";
import { IState, IStateData, StateName } from "../interfaces/State.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";

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
   * @param {AgentName} payload.agentName - The agent name.
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<T>} The state data.
   * @throws Will throw an error if the state is not registered in the agent.
   */
  public getState = async <T extends IStateData = IStateData>(payload: {
    agentName: AgentName;
    stateName: StateName;
  }): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_GET, {
        stateName: payload.stateName,
      });
    if (
      !swarm.agentValidationService.hasState(
        payload.agentName,
        payload.stateName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStateUtils ${payload.stateName} not registered in ${payload.agentName} (getSharedState)`
      );
    }
    return await swarm.sharedStatePublicService.getState(
      METHOD_NAME_GET,
      payload.stateName
    );
  };

  /**
   * Sets the state for a given client and state name.
   * @template T
   * @param {T | ((prevSharedState: T) => Promise<T>)} dispatchFn - The new state or a function that returns the new state.
   * @param {Object} payload - The payload containing client and state information.
   * @param {AgentName} payload.agentName - The agent name.
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<void>}
   * @throws Will throw an error if the state is not registered in the agent.
   */
  public setState = async <T extends IStateData = IStateData>(
    dispatchFn: T | ((prevSharedState: T) => Promise<T>),
    payload: {
      agentName: AgentName;
      stateName: StateName;
    }
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_SET, {
        stateName: payload.stateName,
      });
    if (
      !swarm.agentValidationService.hasState(
        payload.agentName,
        payload.stateName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStateUtils ${payload.stateName} not registered in ${payload.agentName} (setState)`
      );
    }
    if (typeof dispatchFn === "function") {
      return await swarm.sharedStatePublicService.setState(
        dispatchFn as (prevSharedState: T) => Promise<T>,
        METHOD_NAME_SET,
        payload.stateName
      );
    }
    return await swarm.sharedStatePublicService.setState(
      async () => dispatchFn as T,
      METHOD_NAME_SET,
      payload.stateName
    );
  };

  /**
   * Set the state to initial value
   * @template T
   * @param {Object} payload - The payload containing client and state information.
   * @param {AgentName} payload.agentName - The agent name.
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<void>}
   * @throws Will throw an error if the state is not registered in the agent.
   */
  public clearState = async <T extends IStateData = IStateData>(payload: {
    agentName: AgentName;
    stateName: StateName;
  }): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_SET, {
        stateName: payload.stateName,
      });
    if (
      !swarm.agentValidationService.hasState(
        payload.agentName,
        payload.stateName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStateUtils ${payload.stateName} not registered in ${payload.agentName} (clearState)`
      );
    }
    return await swarm.sharedStatePublicService.clearState(
      METHOD_NAME_CLEAR,
      payload.stateName
    );
  };
}

/**
 * Instance of SharedStateUtils for managing state.
 * @type {SharedStateUtils}
 */
export const SharedState = new SharedStateUtils();

export default SharedState;
