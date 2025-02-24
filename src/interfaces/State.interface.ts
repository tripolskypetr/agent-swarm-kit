import { ILogger } from "./Logger.interface";

export type IStateData = any;

export interface IStateMiddleware<T extends IStateData = IStateData> {
  (state: T, clientId: string, stateName: StateName): Promise<T>;
}

export interface IStateCallbacks<T extends IStateData = IStateData> {
  onInit: (clientId: string, stateName: StateName) => void;
  onDispose: (clientId: string, stateName: StateName) => void;
  onLoad: (state: T, clientId: string, stateName: StateName) => void;
  onRead: (state: T, clientId: string, stateName: StateName) => void;
  onWrite: (state: T, clientId: string, stateName: StateName) => void;
}

export interface IStateSchema<T extends IStateData = IStateData> {
  stateName: StateName;
  getState: (clientId: string, stateName: StateName) => T | Promise<T>;
  setState?: (
    state: T,
    clientId: string,
    stateName: StateName
  ) => Promise<void> | void;
  middlewares?: IStateMiddleware<T>[];
  callbacks?: Partial<IStateCallbacks<T>>;
}

export interface IStateParams<T extends IStateData = IStateData>
  extends IStateSchema<T> {
  clientId: string;
  logger: ILogger;
}

export interface IState<T extends IStateData = IStateData> {
  getState: () => Promise<T>;
  setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
}

export type StateName = string;
