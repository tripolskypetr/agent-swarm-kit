import IBaseEvent from "../model/Event.model";

export interface IBus {
  emit<T extends IBaseEvent>(clientId: string, event: T): Promise<void>;
}
