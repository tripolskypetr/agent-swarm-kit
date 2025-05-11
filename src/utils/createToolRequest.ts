import { IToolCall, IToolRequest } from "../model/Tool.model";
import isObject from "./isObject";

export const createToolRequest = ({
    toolName,
    params,
}: IToolRequest): IToolCall => {
  if (!isObject(params)) {
    throw new Error("agent-swarm createToolRequest params is not object");
  }
  return {
    id: `call_${Math.random().toString(36).slice(2, 11)}`,
    type: "function",
    function: {
      name: toolName,
      arguments: params,
    },
  };
};

export default createToolRequest;
