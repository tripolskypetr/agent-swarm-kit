import { IModelMessage } from "src/model/ModelMessage.model";
import { ITool } from "src/model/Tool.model";

export interface ICompletion extends ICompletionSchema { }

export interface ICompletionSchema {
  getCompletion(messages: IModelMessage[], tools?: ITool[]): Promise<IModelMessage>;
}

export type CompletionName = string;
