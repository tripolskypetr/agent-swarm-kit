import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize, queued } from "functools-kit";
import { TContextService } from "../base/ContextService";
import ClientState from "../../../client/ClientState";
import StateSchemaService from "../schema/StateSchemaService";
import {
  IState,
  IStateData,
  StateName,
} from "../../../interfaces/State.interface";
import SessionValidationService from "../validation/SessionValidationService";

export class StateConnectionService<T extends IStateData = IStateData>
  implements IState<T>
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  public getStateRef = memoize(
    ([clientId, stateName]) => `${clientId}-${stateName}`,
    (clientId: string, stateName: StateName) => {
      this.sessionValidationService.addStateUsage(clientId, stateName);
      const {
        getState,
        setState,
        middlewares = [],
        callbacks,
      } = this.stateSchemaService.get(stateName);
      return new ClientState({
        clientId,
        stateName,
        logger: this.loggerService,
        setState: setState
          ? queued(
              async (...args) => await setState(...args)
            ) as typeof setState
          : setState,
        getState,
        middlewares,
        callbacks,
      });
    }
  );

  public setState = async (
    dispatchFn: (prevState: T) => Promise<T>
  ): Promise<T> => {
    this.loggerService.log(`stateConnectionService setState`, {
      context: this.contextService.context,
    });
    const state = this.getStateRef(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
    await state.waitForInit();
    return await state.setState(dispatchFn);
  };

  public getState = async (): Promise<T> => {
    this.loggerService.log(`stateConnectionService getState`, {
      context: this.contextService.context,
    });
    const state = this.getStateRef(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
    await state.waitForInit();
    return await state.getState();
  };

  public dispose = async () => {
    this.loggerService.log(`stateConnectionService dispose`, {
      context: this.contextService.context,
    });
    const key = `${this.contextService.context.clientId}-${this.contextService.context.stateName}`;
    if (!this.getStateRef.has(key)) {
      return;
    }
    const state = this.getStateRef(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
    await state.waitForInit();
    await state.dispose();
    this.getStateRef.clear(key);
    this.sessionValidationService.removeStateUsage(
      this.contextService.context.clientId,
      this.contextService.context.stateName
    );
  };
}

export default StateConnectionService;
