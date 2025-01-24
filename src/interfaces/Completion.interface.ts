import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";

export interface ICompletion extends ICompletionSchema { }

export interface ICompletionSchema {
  completionName: CompletionName;
  getCompletion(agentName: AgentName, messages: IModelMessage[], tools?: ITool[]): Promise<IModelMessage>;
}

export type CompletionName = string;
