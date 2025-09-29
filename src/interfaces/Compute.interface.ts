/**
 * @module ComputeInterface
 * Defines interfaces and types for compute-related operations, including schemas, middleware, callbacks, and contracts.
 */

import { IStateChangeContract } from "../contract/StateChange.contract";
import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";
import { StateName } from "./State.interface";

/**
 * Generic type for compute data, allowing flexibility in data structure.
 * Can be any type to support diverse compute operations.
 */
export type IComputeData = any;

/**
 * @interface IComputeMiddleware
 * @template T - Type extending IComputeData.
 * Defines a middleware function for processing compute data.
 */
export interface IComputeMiddleware<T extends IComputeData = IComputeData> {
  /**
   */
  (state: T, clientId: string, computeName: ComputeName): Promise<T>;
}

/**
 * @interface IComputeCallbacks
 * @template T - Type extending IComputeData.
 * Defines callback functions for compute lifecycle events.
 */
export interface IComputeCallbacks<T extends IComputeData = IComputeData> {
  /**
   * @method onInit
   * Called when the compute is initialized.
   */
  onInit: (clientId: string, computeName: ComputeName) => void;

  /**
   * @method onDispose
   * Called when the compute is disposed.
   */
  onDispose: (clientId: string, computeName: ComputeName) => void;

  /**
   * @method onCompute
   * Called when compute data is processed.
   */
  onCompute: (data: T, clientId: string, computeName: ComputeName) => void;

  /**
   * @method onCalculate
   * Called when a recalculation is triggered by a state change.
   */
  onCalculate: (stateName: StateName, clientId: string, computeName: ComputeName) => void;

  /**
   * Called when the compute is updated.
   * Triggered whenever compute data or configuration changes, allowing for reactive updates.
   */
  onUpdate: (clientId: string, computeName: ComputeName) => void;
}

/**
 * @interface IComputeSchema
 * @template T - Type extending IComputeData.
 * Defines the schema for a compute, including its configuration and dependencies.
 */
export interface IComputeSchema<T extends IComputeData = IComputeData> {
  /**
   * @property {string} [docDescription]
   * Optional description for documentation purposes.
   */
  docDescription?: string;

  /**
   * @property {boolean} [shared]
   * Indicates if the compute is shared across clients.
   */
  shared?: boolean;

  /**
   * @property {ComputeName} computeName
   * The name of the compute.
   */
  computeName: ComputeName;

  /**
   * @property {number} [ttl]
   * Time-to-live for the compute data, in milliseconds.
   */
  ttl?: number;

  /**
   * @property {Function} getComputeData
   * Function to retrieve or compute the data.
   */
  getComputeData: (
    clientId: string,
    computeName: ComputeName,
  ) => T | Promise<T>;

  /**
   * @property {StateName[]} [dependsOn]
   * Array of state names the compute depends on.
   */
  dependsOn?: StateName[];

  /**
   * @property {IComputeMiddleware<T>[]} [middlewares]
   * Array of middleware functions to process compute data.
   */
  middlewares?: IComputeMiddleware<T>[];

  /**
   * Optional callbacks for compute lifecycle events.
   * Provides hooks for handling compute updates, data changes, and other lifecycle events.
   */
  callbacks?: Partial<IComputeCallbacks<T>>;
}

/**
 * @interface IComputeParams
 * @template T - Type extending IComputeData.
 * @extends IComputeSchema<T>
 * Extends compute schema with additional parameters for compute initialization.
 */
export interface IComputeParams<T extends IComputeData = IComputeData>
  extends IComputeSchema<T> {
  /**
   * @property {string} clientId
   * The client identifier.
   */
  clientId: string;

  /**
   * @property {ILogger} logger
   * Logger instance for logging compute operations.
   */
  logger: ILogger;

  /**
   * @property {IBus} bus
   * Bus instance for event communication.
   */
  bus: IBus;

  /**
   * Array of state change contracts for state dependencies.
   * Defines which state changes trigger compute recalculation and data updates.
   */
  binding: IStateChangeContract[];
}

/**
 * @interface ICompute
 * @template T - Type extending IComputeData.
 * Defines the contract for compute operations.
 */
export interface ICompute<T extends IComputeData = IComputeData> {
  /**
   * @method calculate
   * Triggers a recalculation based on a state change.
   */
  calculate: (stateName: StateName) => Promise<void>;

  /**
   * @method update
   * Forces an update of the compute instance.
   */
  update: (clientId: string, computeName: ComputeName) => Promise<void>;

  /**
   * Retrieves the computed data.
   * Returns the current result of the compute operation, either synchronously or asynchronously.
   */
  getComputeData: () => T | Promise<T>;
}

/**
 * Type alias for the compute name, represented as a string.
 * Used to identify and reference specific compute instances.
 */
export type ComputeName = string;
