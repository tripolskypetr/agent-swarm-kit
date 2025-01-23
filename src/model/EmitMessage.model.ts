import { AgentName } from "src/interfaces/Agent.interface";

export interface IIncomingMessage {
  clientId: string;
  data: string;
  agentName: AgentName;
}

export interface IOutgoingMessage {
  clientId: string;
  data: string;
  agentName: AgentName;
}
