import swarm from "../lib";
import { IState, IStateData, StateName } from "../interfaces/State.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "../utils/beginContext";

/**
 * Type definition for a state object, mapping IState keys to unknown values.
 * @typedef {{ [key in keyof IState]: unknown }} TState
 */
type TState = {
  [key in keyof IState]: unknown;
};

/** @private Constant for logging the getState method in StateUtils */
const METHOD_NAME_GET = "StateUtils.getState";

/** @private Constant for logging the setState method in StateUtils */
const METHOD_NAME_SET = "StateUtils.setState";

/** @private Constant for logging the clearState method in StateUtils */
const METHOD_NAME_CLEAR = "StateUtils.clearState";

/**
 * Utility class for managing client-specific state within an agent swarm.
 * Provides methods to get, set, and clear state data for specific clients, agents, and state names,
 * interfacing with the swarm's state service and enforcing agent-state registration.
 * @implements {TState}
 */
export class StateUtils implements TState {
  /**
   * Retrieves the state data for a given client, agent, and state name.
   * Validates the client session and agent-state registration before querying the state service.
   * Executes within a context for logging.
   * @template T - The type of the state data to retrieve, defaults to any.
   * @param {Object} payload - The payload containing client, agent, and state information.
   * @param {string} payload.clientId - The ID of the client whose state is being retrieved.
   * @param {AgentName} payload.agentName - The name of the agent associated with the state.
   * @param {StateName} payload.stateName - The name of the state to retrieve.
   * @returns {Promise<T>} A promise resolving to the state data associated with the client and state name.
   * @throws {Error} If the client session is invalid, the state is not registered in the agent, or the state service encounters an error.
   */
  public getState = beginContext(
    async (payload: {
      clientId: string;
      agentName: AgentName;
      stateName: StateName;
    }) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET, {
          clientId: payload.clientId,
          stateName: payload.stateName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_GET
      );
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
    }
  ) as <T extends unknown = any>(payload: {
    clientId: string;
    agentName: AgentName;
    stateName: StateName;
  }) => Promise<T>;

  /**
   * Sets the state data for a given client, agent, and state name.
   * Accepts either a direct value or a function that computes the new state based on the previous state.
   * Validates the client session and agent-state registration before updating via the state service.
   * Executes within a context for logging.
   * @template T - The type of the state data to set, defaults to any.
   * @param {T | ((prevState: T) => Promise<T>)} dispatchFn - The new state value or an async function that takes the previous state and returns the new state.
   * @param {Object} payload - The payload containing client, agent, and state information.
   * @param {string} payload.clientId - The ID of the client whose state is being updated.
   * @param {AgentName} payload.agentName - The name of the agent associated with the state.
   * @param {StateName} payload.stateName - The name of the state to update.
   * @returns {Promise<void>} A promise that resolves when the state is successfully updated.
   * @throws {Error} If the client session is invalid, the state is not registered in the agent, or the state service encounters an error.
   */
  public setState = beginContext(
    async (
      dispatchFn: IStateData | ((prevState: IStateData) => Promise<IStateData>),
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
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_SET
      );
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
          dispatchFn as (prevState: IStateData) => Promise<IStateData>,
          METHOD_NAME_SET,
          payload.clientId,
          payload.stateName
        );
      }
      return await swarm.statePublicService.setState(
        async () => dispatchFn,
        METHOD_NAME_SET,
        payload.clientId,
        payload.stateName
      );
    }
  ) as <T extends unknown = any>(
    dispatchFn: T | ((prevState: T) => Promise<T>),
    payload: {
      clientId: string;
      agentName: AgentName;
      stateName: StateName;
    }
  ) => Promise<void>;

  /**
   * Clears the state data for a given client, agent, and state name, resetting it to its initial value.
   * Validates the client session and agent-state registration before clearing via the state service.
   * Executes within a context for logging.
   * @template T - The type of the state data, defaults to any (unused in return).
   * @param {Object} payload - The payload containing client, agent, and state information.
   * @param {string} payload.clientId - The ID of the client whose state is being cleared.
   * @param {AgentName} payload.agentName - The name of the agent associated with the state.
   * @param {StateName} payload.stateName - The name of the state to clear.
   * @returns {Promise<void>} A promise that resolves when the state is successfully cleared.
   * @throws {Error} If the client session is invalid, the state is not registered in the agent, or the state service encounters an error.
   */
  public clearState = beginContext(
    async (payload: {
      clientId: string;
      agentName: AgentName;
      stateName: StateName;
    }) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_CLEAR, {
          clientId: payload.clientId,
          stateName: payload.stateName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_CLEAR
      );
      if (
        !swarm.agentValidationService.hasState(
          payload.agentName,
          payload.stateName
        )
      ) {
        throw new Error(
          `agent-swarm StateUtils ${payload.stateName} not registered in ${payload.agentName} (clearState)`
        );
      }
      return await swarm.statePublicService.clearState(
        METHOD_NAME_CLEAR,
        payload.clientId,
        payload.stateName
      );
    }
  ) as <T extends unknown = any>(payload: {
    clientId: string;
    agentName: AgentName;
    stateName: StateName;
  }) => Promise<T>;
}

/**
 * Singleton instance of StateUtils for managing client-specific state operations.
 * @type {StateUtils}
 */
export const State = new StateUtils();

export default State;
