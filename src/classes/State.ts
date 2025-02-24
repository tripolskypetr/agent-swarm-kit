import swarm from "../lib";
import { IState, IStateData, StateName } from "../interfaces/State.interface";
import { AgentName } from "../interfaces/Agent.interface";

type TState = {
  [key in keyof IState]: unknown;
};

export class StateUtils implements TState {
  public getState = async <T extends IStateData = IStateData>(payload: {
    clientId: string;
    agentName: AgentName;
    stateName: StateName;
  }): Promise<T> => {
    swarm.loggerService.log("StateUtils getState", {
      clientId: payload.clientId,
      stateName: payload.stateName,
    });
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
      payload.clientId,
      payload.stateName
    );
  };

  public setState = async <T extends IStateData = IStateData>(
    dispatchFn: T | ((prevState: T) => Promise<T>),
    payload: {
      clientId: string;
      agentName: AgentName;
      stateName: StateName;
    }
  ): Promise<void> => {
    swarm.loggerService.log("StateUtils getState", {
      clientId: payload.clientId,
      stateName: payload.stateName,
    });
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
        payload.clientId,
        payload.stateName
      );
    }
    return await swarm.statePublicService.setState(
      async () => dispatchFn as T,
      payload.clientId,
      payload.stateName
    );
  };
}

export const State = new StateUtils();

export default State;
