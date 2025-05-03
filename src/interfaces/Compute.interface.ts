/**
 * @module ComputeInterface
 * @description Defines interfaces and types for compute-related operations, including schemas, middleware, callbacks, and contracts.
 */

import { IStateChangeContract } from "../contract/StateChange.contract";
import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";
import { StateName } from "./State.interface";

/**
 * @typedef {any} IComputeData
 * @description Generic type for compute data, allowing flexibility in data structure.
 */
export type IComputeData = any;

/**
 * @interface IComputeMiddleware
 * @template T - Type extending IComputeData.
 * @description Defines a middleware function for processing compute data.
 */
export interface IComputeMiddleware<T extends IComputeData = IComputeData> {
  /**
   * @param {T} state - The current compute data.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   * @returns {Promise<T>} The processed compute data.
   */
  (state: T, clientId: string, computeName: ComputeName): Promise<T>;
}

/**
 * @interface IComputeCallbacks
 * @template T - Type extending IComputeData.
 * @description Defines callback functions for compute lifecycle events.
 */
export interface IComputeCallbacks<T extends IComputeData = IComputeData> {
  /**
   * @method onInit
   * @description Called when the compute is initialized.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   */
  onInit: (clientId: string, computeName: ComputeName) => void;

  /**
   * @method onDispose
   * @description Called when the compute is disposed.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   */
  onDispose: (clientId: string, computeName: ComputeName) => void;

  /**
   * @method onCompute
   * @description Called when compute data is processed.
   * @param {T} data - The computed data.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   */
  onCompute: (data: T, clientId: string, computeName: ComputeName) => void;

  /**
   * @method onCalculate
   * @description Called when a recalculation is triggered by a state change.
   * @param {StateName} stateName - The name of the state that changed.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   */
  onCalculate: (stateName: StateName, clientId: string, computeName: ComputeName) => void;

  /**
   * @method onUpdate
   * @description Called when the compute is updated.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   */
  onUpdate: (clientId: string, computeName: ComputeName) => void;
}

/**
 * @interface IComputeSchema
 * @template T - Type extending IComputeData.
 * @description Defines the schema for a compute, including its configuration and dependencies.
 */
export interface IComputeSchema<T extends IComputeData = IComputeData> {
  /**
   * @property {string} [docDescription]
   * @description Optional description for documentation purposes.
   */
  docDescription?: string;

  /**
   * @property {boolean} [shared]
   * @description Indicates if the compute is shared across clients.
   */
  shared?: boolean;

  /**
   * @property {ComputeName} computeName
   * @description The name of the compute.
   */
  computeName: ComputeName;

  /**
   * @property {Function} getComputeData
   * @description Function to retrieve or compute the data.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   * @returns {T | Promise<T>} The computed data or a promise resolving to it.
   */
  getComputeData: (
    clientId: string,
    computeName: ComputeName,
  ) => T | Promise<T>;

  /**
   * @property {StateName[]} [dependsOn]
   * @description Array of state names the compute depends on.
   */
  dependsOn?: StateName[];

  /**
   * @property {IComputeMiddleware<T>[]} [middlewares]
   * @description Array of middleware functions to process compute data.
   */
  middlewares?: IComputeMiddleware<T>[];

  /**
   * @property {Partial<IComputeCallbacks<T>>} [callbacks]
   * @description Optional callbacks for compute lifecycle events.
   */
  callbacks?: Partial<IComputeCallbacks<T>>;
}

/**
 * @interface IComputeParams
 * @template T - Type extending IComputeData.
 * @extends IComputeSchema<T>
 * @description Extends compute schema with additional parameters for compute initialization.
 */
export interface IComputeParams<T extends IComputeData = IComputeData>
  extends IComputeSchema<T> {
  /**
   * @property {string} clientId
   * @description The client identifier.
   */
  clientId: string;

  /**
   * @property {ILogger} logger
   * @description Logger instance for logging compute operations.
   */
  logger: ILogger;

  /**
   * @property {IBus} bus
   * @description Bus instance for event communication.
   */
  bus: IBus;

  /**
   * @property {IStateChangeContract[]} binding
   * @description Array of state change contracts for state dependencies.
   */
  binding: IStateChangeContract[];
}

/**
 * @interface ICompute
 * @template T - Type extending IComputeData.
 * @description Defines the contract for compute operations.
 */
export interface ICompute<T extends IComputeData = IComputeData> {
  /**
   * @method calculate
   * @description Triggers a recalculation based on a state change.
   * @param {StateName} stateName - The name of the state that changed.
   * @returns {Promise<void>} Resolves when the calculation is complete.
   */
  calculate: (stateName: StateName) => Promise<void>;

  /**
   * @method update
   * @description Forces an update of the compute instance.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   * @returns {Promise<void>} Resolves when the update is complete.
   */
  update: (clientId: string, computeName: ComputeName) => Promise<void>;

  /**
   * @method getComputeData
   * @description Retrieves the computed data.
   * @returns {T | Promise<T>} The computed data or a promise resolving to it.
   */
  getComputeData: () => T | Promise<T>;
}

/**
 * @typedef {string} ComputeName
 * @description Type alias for the compute name, represented as a string.
 */
export type ComputeName = string;
