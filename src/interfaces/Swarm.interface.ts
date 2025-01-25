import { AgentName, IAgent } from "../interfaces/Agent.interface";
import { ILogger } from "../interfaces/Logger.interface";

export interface ISwarmParams extends Omit<ISwarmSchema, keyof {
  agentList: never;
}> {
  clientId: string;
  logger: ILogger;
  agentMap: Record<AgentName, IAgent>;
}

export interface ISwarmSchema {
  defaultAgent: AgentName;
  swarmName: string;
  agentList: string[];
}

export interface ISwarm {
  waitForOutput(): Promise<string>;
  getAgentName(): Promise<AgentName>;
  getAgent(): Promise<IAgent>;
  setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;
  setAgentName(agentName: AgentName): Promise<void>;
}

export type SwarmName = string;

export default ISwarm;
