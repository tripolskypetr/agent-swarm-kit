import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";

export interface ICompletion extends ICompletionSchema { }

export interface ICompletionArgs {
  clientId: string,
  agentName: AgentName, 
  messages: IModelMessage[],
  tools?: ITool[]
}

export interface ICompletionSchema {
  completionName: CompletionName;
  getCompletion(args: ICompletionArgs): Promise<IModelMessage>;
}

export type CompletionName = string;
