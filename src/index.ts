export * from "./lib";

export * from "./functions/addAgent";
export * from "./functions/addCompletion";
export * from "./functions/addSwarm";
export * from "./functions/addTool";
export * from "./functions/addEmbeding";
export * from "./functions/addStorage";
export * from "./functions/makeConnection";
export * from "./functions/changeAgent";
export * from "./functions/complete";
export * from "./functions/session";
export * from "./functions/disposeConnection";
export * from "./functions/getRawHistory";
export * from "./functions/getAgentHistory";
export * from "./functions/getSessionMode";
export * from "./functions/commitToolOutput";
export * from "./functions/commitSystemMessage";
export * from "./functions/commitFlush";
export * from "./functions/commitUserMessage";
export * from "./functions/execute";
export * from "./functions/emit";
export * from "./functions/commitToolOutputForce";
export * from "./functions/commitSystemMessageForce";
export * from "./functions/commitFlushForce";
export * from "./functions/commitUserMessageForce";
export * from "./functions/emitForce";
export * from "./functions/executeForce";
export * from "./functions/getLastUserMessage";
export * from "./functions/getAgentName";
export * from "./functions/getUserHistory";
export * from "./functions/getAssistantHistory";
export * from "./functions/getLastAssistantMessage";
export * from "./functions/getLastSystemMessage";
export * from "./functions/makeAutoDispose";

export { IAgentSchema } from "./interfaces/Agent.interface";
export {
  ICompletionSchema,
  ICompletionArgs,
} from "./interfaces/Completion.interface";
export { ISwarmSchema } from "./interfaces/Swarm.interface";
export { IAgentTool } from "./interfaces/Agent.interface";

export { IEmbeddingSchema } from "./interfaces/Embedding.interface";
export { IStorageSchema } from "./interfaces/Storage.interface";

export { IModelMessage } from "./model/ModelMessage.model";
export { IIncomingMessage, IOutgoingMessage } from "./model/EmitMessage.model";
export { ITool, IToolCall } from "./model/Tool.model";

export {
  SendMessageFn,
  ReceiveMessageFn,
} from "./interfaces/Session.interface";

export { setConfig } from "./config/params";

export { Storage } from "./classes/Storage";
export {
  History,
  HistoryAdapter as _HistoryAdapter,
  HistoryInstance as _HistoryInstance,
  IHistoryAdapter,
  IHistoryInstance,
  IHistoryInstanceCallbacks,
} from "./classes/History";
