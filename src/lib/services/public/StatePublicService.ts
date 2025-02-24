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
};

type TStateConnectionService = {
  [key in Exclude<keyof IStateConnectionService, InternalKeys>]: unknown;
};

export class StatePublicService<T extends IStateData = IStateData> implements TStateConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>,
    clientId: string,
    stateName: StateName,
  ): Promise<T> => {
    this.loggerService.log(`statePublicService setState`, {
      clientId,
      stateName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.stateConnectionService.setState(dispatchFn);
      },
      {
        clientId,
        stateName,
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };

  public getState = async (
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
        clientId,
        stateName,
        agentName: "",
        swarmName: "",
        storageName: "",
      }
    );
  };

  public dispose = async (clientId: string, stateName: StateName) => {
    this.loggerService.log("statePublicService dispose", {
      clientId,
      stateName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.stateConnectionService.dispose();
      },
      {
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
