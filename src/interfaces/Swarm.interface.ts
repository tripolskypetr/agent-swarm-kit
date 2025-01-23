import { AgentName, IAgent } from "./Agent.interface";
import { ILogger } from "./Logger.interface";

export interface ISwarmParams extends Omit<ISwarmSpec, keyof {
  agentList: never;
}> {
  clientId: string;
  logger: ILogger;
  agentMap: Record<AgentName, IAgent>;
}

export interface ISwarmSpec {
  defaultAgent: AgentName;
  agentList: string[];
}

export interface ISwarm {
  waitForOutput(): Promise<string>;
  getAgentName(): Promise<AgentName>;
  getAgent(): Promise<IAgent>;
  setAgentName(agentName: AgentName): Promise<void>;
}

export type SwarmName = string;

export default ISwarm;
