import swarm from "../lib";
import { IState, IStateData, StateName } from "../interfaces/State.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";

type TState = {
  [key in keyof IState]: unknown;
};

const METHOD_NAME_GET = "StateUtils.getState";
const METHOD_NAME_SET = "StateUtils.setState";

/**
 * Utility class for managing state in the agent swarm.
 * @implements {TState}
 */
export class StateUtils implements TState {
  /**
   * Retrieves the state for a given client and state name.
   * @template T
   * @param {Object} payload - The payload containing client and state information.
   * @param {string} payload.clientId - The client ID.
   * @param {AgentName} payload.agentName - The agent name.
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<T>} The state data.
   * @throws Will throw an error if the state is not registered in the agent.
   */
  public getState = async <T extends IStateData = IStateData>(payload: {
    clientId: string;
    agentName: AgentName;
    stateName: StateName;
  }): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_GET, {
        clientId: payload.clientId,
        stateName: payload.stateName,
      });
    swarm.sessionValidationService.validate(payload.clientId, METHOD_NAME_GET);
    if (
      !swarm.agentValidationService.hasState(
        payload.agentName,
        payload.stateName
      )
    ) {
      throw new Error(
        `agent-swarm StateUtils ${payload.stateName} not registered in ${payload.agentName} (getState)`
      );
    }
    return await swarm.statePublicService.getState(
      METHOD_NAME_GET,
      payload.clientId,
      payload.stateName
    );
  };

  /**
   * Sets the state for a given client and state name.
   * @template T
   * @param {T | ((prevState: T) => Promise<T>)} dispatchFn - The new state or a function that returns the new state.
   * @param {Object} payload - The payload containing client and state information.
   * @param {string} payload.clientId - The client ID.
   * @param {AgentName} payload.agentName - The agent name.
   * @param {StateName} payload.stateName - The state name.
   * @returns {Promise<void>}
   * @throws Will throw an error if the state is not registered in the agent.
   */
  public setState = async <T extends IStateData = IStateData>(
    dispatchFn: T | ((prevState: T) => Promise<T>),
    payload: {
      clientId: string;
      agentName: AgentName;
      stateName: StateName;
    }
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_SET, {
        clientId: payload.clientId,
        stateName: payload.stateName,
      });
    swarm.sessionValidationService.validate(payload.clientId, METHOD_NAME_SET);
    if (
      !swarm.agentValidationService.hasState(
        payload.agentName,
        payload.stateName
      )
    ) {
      throw new Error(
        `agent-swarm StateUtils ${payload.stateName} not registered in ${payload.agentName} (setState)`
      );
    }
    if (typeof dispatchFn === "function") {
      return await swarm.statePublicService.setState(
        dispatchFn as (prevState: T) => Promise<T>,
        METHOD_NAME_SET,
        payload.clientId,
        payload.stateName
      );
    }
    return await swarm.statePublicService.setState(
      async () => dispatchFn as T,
      METHOD_NAME_SET,
      payload.clientId,
      payload.stateName
    );
  };
}

/**
 * Instance of StateUtils for managing state.
 * @type {StateUtils}
 */
export const State = new StateUtils();

export default State;
