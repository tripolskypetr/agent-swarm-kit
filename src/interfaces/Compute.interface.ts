import { IStateChangeContract } from "../contract/StateChange.contract";
import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";
import { StateName } from "./State.interface";

export type IComputeData = any;

export interface IComputeMiddleware<T extends IComputeData = IComputeData> {
  (state: T, clientId: string, computeName: ComputeName): Promise<T>;
}

export interface IComputeCallbacks<T extends IComputeData = IComputeData> {
  onInit: (clientId: string, computeName: ComputeName) => void;
  onDispose: (clientId: string, computeName: ComputeName) => void;
  onCompute: (data: T, clientId: string, computeName: ComputeName) => void;
  onCalculate: (stateName: StateName, clientId: string, computeName: ComputeName) => void;
  onUpdate: (clientId: string, computeName: ComputeName) => void;
}

export interface IComputeSchema<T extends IComputeData = IComputeData> {
  docDescription?: string;
  shared?: boolean;
  computeName: ComputeName;
  getComputeData: (
    clientId: string,
    computeName: ComputeName,
  ) => T | Promise<T>;
  dependsOn?: StateName[];
  middlewares?: IComputeMiddleware<T>[];
  callbacks?: Partial<IComputeCallbacks<T>>;
}

export interface IComputeParams<T extends IComputeData = IComputeData>
  extends IComputeSchema<T> {
  clientId: string;
  logger: ILogger;
  bus: IBus;
  binding: IStateChangeContract[];
}

export interface ICompute<T extends IComputeData = IComputeData> {
  calculate: (stateName: StateName) => Promise<void>;
  update: (clientId: string, computeName: ComputeName) => Promise<void>;
  getComputeData: () => T | Promise<T>;
}

export type ComputeName = string;
