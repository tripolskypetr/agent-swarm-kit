import { IModelMessage } from "src/model/ModelMessage.model";
import { ITool } from "src/model/Tool.model";

export interface ICompletion {
  getCompletion(messages: IModelMessage[], tools?: ITool[]): Promise<IModelMessage>;
}
