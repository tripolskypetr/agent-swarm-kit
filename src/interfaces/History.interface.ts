import { AgentName } from "./Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { ILogger } from "./Logger.interface";
import { IPubsubArray } from "functools-kit";

export interface IHistory {
  push(message: IModelMessage): Promise<void>;
  toArrayForAgent(prompt: string): Promise<IModelMessage[]>;
  toArrayForRaw(): Promise<IModelMessage[]>;
}

export interface IHistoryParams extends IHistorySchema{
  agentName: AgentName;
  clientId: string;
  logger: ILogger;
}

export interface IHistorySchema {
  items: IPubsubArray<IModelMessage>;
}

export default IHistory;
