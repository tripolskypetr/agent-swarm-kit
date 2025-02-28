import { inject } from "../../core/di";
import { StateConnectionService } from "../connection/StateConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IStateData, StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

interface IStateConnectionService extends StateConnectionService {}

type InternalKeys = keyof {
  getStateRef: never;
  getSharedStateRef: never;
};

type TStateConnectionService = {
  [key in Exclude<keyof IStateConnectionService, InternalKeys>]: unknown;
};

export class StatePublicService<T extends IStateData = IStateData>
  implements TStateConnectionService
{
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
    methodName: string,
    clientId: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`statePublicService setState`, {
        methodName,
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.setState(dispatchFn);
      },
      {
        methodName,
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
    methodName: string,
    clientId: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`statePublicService getState`, {
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.getState();
      },
      {
        methodName,
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
  public dispose = async (
    methodName: string,
    clientId: string,
    stateName: StateName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("statePublicService dispose", {
        methodName,
        clientId,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.stateConnectionService.dispose();
      },
      {
        methodName,
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
