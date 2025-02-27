import { inject } from "../../core/di";
import { StateConnectionService } from "../connection/StateConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
import {
  IStateData,
  StateName,
} from "../../../interfaces/State.interface";

interface IStateConnectionService extends StateConnectionService {}

type InternalKeys = keyof {
  getStateRef: never;
  getSharedStateRef: never;
};

type TStateConnectionService = {
  [key in Exclude<keyof IStateConnectionService, InternalKeys>]: unknown;
};

export class StatePublicService<T extends IStateData = IStateData> implements TStateConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  /**
   * Sets the state using the provided dispatch function.
   * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the state change.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<T>} - The updated state.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>,
    requestId: string,
    clientId: string,
    stateName: StateName,
  ): Promise<T> => {
    this.loggerService.log(`statePublicService setState`, {
      requestId,
      clientId,
      stateName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.stateConnectionService.setState(dispatchFn);
      },
      {
        requestId,
        clientId,
        stateName,
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };

  /**
   * Gets the current state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<T>} - The current state.
   */
  public getState = async (
    requestId: string,
    clientId: string,
    stateName: StateName,
  ): Promise<T> => {
    this.loggerService.log(`statePublicService getState`, {
      clientId,
      stateName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.stateConnectionService.getState();
      },
      {
        requestId,
        clientId,
        stateName,
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };

  /**
   * Disposes the state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<void>} - A promise that resolves when the state is disposed.
   */
  public dispose = async (requestId: string, clientId: string, stateName: StateName) => {
    this.loggerService.log("statePublicService dispose", {
      requestId,
      clientId,
      stateName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.stateConnectionService.dispose();
      },
      {
        requestId,
        clientId,
        stateName,
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };
}

export default StatePublicService;
