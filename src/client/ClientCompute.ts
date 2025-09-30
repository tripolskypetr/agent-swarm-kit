/**
 * Provides a class for managing client-side computations with event handling and state management.
*/

import { compose, IClearableTtl, ttl } from "functools-kit";
import {
  ICompute,
  IComputeData,
  IComputeParams,
} from "../interfaces/Compute.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { StateName } from "../interfaces/State.interface";

type ComputeDataFn = (() => ReturnType<typeof GET_COMPUTE_DATA_FN>) &
  IClearableTtl;

/**
 * @constant {symbol} DISPOSE_SLOT_FN_SYMBOL
 * Symbol for the dispose function slot.
 **/
const DISPOSE_SLOT_FN_SYMBOL = Symbol("dispose");

/**
 * @constant {symbol} GET_COMPUTE_DATA_FN_SYMBOL
 * Symbol for the compute data function slot.
 **/
const GET_COMPUTE_DATA_FN_SYMBOL = Symbol("compute");

/**
 * @function GET_COMPUTE_DATA_FN
 * Retrieves computation data and emits a bus event with the result.
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
 * Manages client-side computations, state subscriptions, and lifecycle events.
*/
export class ClientCompute<Compute extends IComputeData = IComputeData>
  implements ICompute<Compute>
{
  /**
   * Stores the composed dispose function.
   **/
  private [DISPOSE_SLOT_FN_SYMBOL] = () => {};

  /**
   * Memoized function for retrieving compute data.
   **/
  private [GET_COMPUTE_DATA_FN_SYMBOL]: ComputeDataFn;

  /**
   * @constructor
   * Initializes the ClientCompute instance, sets up state subscriptions, and triggers onInit callback.
  */
  constructor(readonly params: IComputeParams<Compute>) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} shared=${this.params.shared} CTOR`,
        {
          params,
        }
      );
    this[GET_COMPUTE_DATA_FN_SYMBOL] = ttl(
      async () => {
        return await GET_COMPUTE_DATA_FN(this);
      },
      {
        timeout: params.ttl!,
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
   * Retrieves the computation data using a memoized function.
   */
  async getComputeData() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} shared=${this.params.shared} getComputeData`
      );
    return await this[GET_COMPUTE_DATA_FN_SYMBOL]();
  }

  /**
   * Triggers a recalculation based on a state change and clears memoized data.
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
   * Forces an update of the computation and clears memoized data.
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
   * Cleans up resources, unsubscribes from state changes, and triggers onDispose callback.
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
 * * Exports the ClientCompute class as the default export.
*/
export default ClientCompute;
