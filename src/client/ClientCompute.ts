import { compose, singleshot } from "functools-kit";
import {
  ICompute,
  IComputeData,
  IComputeParams,
} from "../interfaces/Compute.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { StateName } from "../interfaces/State.interface";

const DISPOSE_SLOT_FN_SYMBOL = Symbol("dispose");
const GET_COMPUTE_DATA_FN_SYMBOL = Symbol("compute");

const GET_COMPUTE_DATA_FN = async (self: ClientCompute) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientCompute computeName=${self.params.computeName} clientId=${self.params.clientId} getComputeData`
    );
  const data = await self.params.getComputeData(
    self.params.clientId,
    self.params.computeName
  );
  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "emit-output",
    source: "compute-bus",
    input: {},
    output: {
      data,
    },
    context: {
      computeName: self.params.computeName,
    },
    clientId: self.params.clientId,
  });
  return data;
};

export class ClientCompute<Compute extends IComputeData = IComputeData>
  implements ICompute<Compute>
{
  private [DISPOSE_SLOT_FN_SYMBOL] = () => {};

  private [GET_COMPUTE_DATA_FN_SYMBOL] = singleshot(async () => {
    return await GET_COMPUTE_DATA_FN(this);
  });

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

  async getComputeData() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientCompute computeName=${this.params.computeName} clientId=${this.params.clientId} shared=${this.params.shared} getComputeData`
      );
    return await this[GET_COMPUTE_DATA_FN_SYMBOL]();
  }

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

export default ClientCompute;
