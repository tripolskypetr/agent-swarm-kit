/**
 * @module ClientCompute
 * @description Provides a class for managing client-side computations with event handling and state management.
 */

import { compose, singleshot } from "functools-kit";
import {
  ICompute,
  IComputeData,
  IComputeParams,
} from "../interfaces/Compute.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { StateName } from "../interfaces/State.interface";

/**
 * @constant {symbol} DISPOSE_SLOT_FN_SYMBOL
 * @description Symbol for the dispose function slot.
 * @private
 */
const DISPOSE_SLOT_FN_SYMBOL = Symbol("dispose");

/**
 * @constant {symbol} GET_COMPUTE_DATA_FN_SYMBOL
 * @description Symbol for the compute data function slot.
 * @private
 */
const GET_COMPUTE_DATA_FN_SYMBOL = Symbol("compute");

/**
 * @function GET_COMPUTE_DATA_FN
 * @description Retrieves computation data and emits a bus event with the result.
 * @param {ClientCompute} self - The ClientCompute instance.
 * @returns {Promise<IComputeData>} The computed data.
 * @private
 */
const GET_COMPUTE_DATA_FN = async (self: ClientCompute) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientCompute computeName=${self.params.computeName} clientId=${self.params.clientId} getComputeData`
    );
  let currentData = await self.params.getComputeData(
    self.params.clientId,
    self.params.computeName
  );
  for (const middleware of self.params.middlewares) {
    currentData = await middleware(
      currentData,
      self.params.clientId,
      self.params.computeName
    );
  }
  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "emit-output",
    source: "compute-bus",
    input: {},
    output: {
      data: currentData,
    },
    context: {
      computeName: self.params.computeName,
    },
    clientId: self.params.clientId,
  });
  return currentData;
};

/**
 * @class ClientCompute
 * @template Compute - Type extending IComputeData.
 * @implements {ICompute<Compute>}
 * @description Manages client-side computations, state subscriptions, and lifecycle events.
 */
export class ClientCompute<Compute extends IComputeData = IComputeData>
  implements ICompute<Compute>
{
  /**
   * @property {Function} DISPOSE_SLOT_FN_SYMBOL
   * @description Stores the composed dispose function.
   * @private
   */
  private [DISPOSE_SLOT_FN_SYMBOL] = () => {};

  /**
   * @property {Function} GET_COMPUTE_DATA_FN_SYMBOL
   * @description Memoized function for retrieving compute data.
   * @private
   */
  private [GET_COMPUTE_DATA_FN_SYMBOL] = singleshot(async () => {
    return await GET_COMPUTE_DATA_FN(this);
  });

  /**
   * @constructor
   * @param {IComputeParams<Compute>} params - Configuration parameters for the computation.
   * @description Initializes the ClientCompute instance, sets up state subscriptions, and triggers onInit callback.
   */
  constructor(readonly params: IComputeParams<Compute>) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} shared=${this.params.shared} CTOR`,
        {
          params,
        }
      );
    this.params.binding.forEach(
      ({ stateChanged }) =>
        (this[DISPOSE_SLOT_FN_SYMBOL] = compose(
          this[DISPOSE_SLOT_FN_SYMBOL],
          stateChanged.subscribe((stateName) => this.calculate(stateName))
        ))
    );
    if (this.params.callbacks?.onInit) {
      this.params.callbacks.onInit(
        this.params.clientId,
        this.params.computeName
      );
    }
  }

  /**
   * @method getComputeData
   * @description Retrieves the computation data using a memoized function.
   * @returns {Promise<Compute>} The computed data.
   * @async
   */
  async getComputeData() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} shared=${this.params.shared} getComputeData`
      );
    return await this[GET_COMPUTE_DATA_FN_SYMBOL]();
  }

  /**
   * @method calculate
   * @description Triggers a recalculation based on a state change and clears memoized data.
   * @param {StateName} stateName - The name of the state that changed.
   */
  async calculate(stateName: StateName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} computeName=${this.params.computeName} stateName=${stateName} calculate`
      );
    this[GET_COMPUTE_DATA_FN_SYMBOL].clear();
    if (this.params.callbacks?.onCalculate) {
      this.params.callbacks.onCalculate(
        stateName,
        this.params.clientId,
        this.params.computeName
      );
    }
  }

  /**
   * @method update
   * @description Forces an update of the computation and clears memoized data.
   */
  async update() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} computeName=${this.params.computeName} update`
      );
    this[GET_COMPUTE_DATA_FN_SYMBOL].clear();
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks.onUpdate(
        this.params.clientId,
        this.params.computeName
      );
    }
  }

  /**
   * @method dispose
   * @description Cleans up resources, unsubscribes from state changes, and triggers onDispose callback.
   * @returns {Promise<void>}
   * @async
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} shared=${this.params.shared} dispose`
      );
    this[DISPOSE_SLOT_FN_SYMBOL]();
    if (this.params.callbacks?.onDispose) {
      this.params.callbacks.onDispose(
        this.params.clientId,
        this.params.computeName
      );
    }
  }
}

/**
 * @export
 * @default ClientCompute
 * @description Exports the ClientCompute class as the default export.
 */
export default ClientCompute;
