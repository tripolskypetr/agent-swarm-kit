import { inject } from "../../core/di";
import { SharedStateConnectionService } from "../connection/SharedStateConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IStateData, StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

interface ISharedStateConnectionService extends SharedStateConnectionService {}

type InternalKeys = keyof {
  getStateRef: never;
  getSharedStateRef: never;
};

type TSharedStateConnectionService = {
  [key in Exclude<keyof ISharedStateConnectionService, InternalKeys>]: unknown;
};

export class SharedStatePublicService<T extends IStateData = IStateData>
  implements TSharedStateConnectionService
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly sharedStateConnectionService =
    inject<SharedStateConnectionService>(TYPES.sharedStateConnectionService);

  /**
   * Sets the state using the provided dispatch function.
   * @param {function(T): Promise<T>} dispatchFn - The function to dispatch the state change.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<T>} - The updated state.
   */
  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>,
    methodName: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStatePublicService setState`, {
        methodName,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStateConnectionService.setState(dispatchFn);
      },
      {
        methodName,
        clientId: "",
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };

  /**
   * Set the state to initial value
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<T>} - The initial state.
   */
  public clearState = async (
    methodName: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStatePublicService clearState`, {
        methodName,
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStateConnectionService.clearState();
      },
      {
        methodName,
        clientId: "",
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };

  /**
   * Gets the current state.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<T>} - The current state.
   */
  public getState = async (
    methodName: string,
    stateName: StateName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStatePublicService getState`, {
        stateName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStateConnectionService.getState();
      },
      {
        methodName,
        clientId: "",
        stateName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };
}

export default SharedStatePublicService;
