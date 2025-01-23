import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";

export interface ICompletion extends ICompletionSchema { }

export interface ICompletionSchema {
  getCompletion(messages: IModelMessage[], tools?: ITool[]): Promise<IModelMessage>;
}

export type CompletionName = string;
