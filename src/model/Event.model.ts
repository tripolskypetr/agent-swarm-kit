import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StorageName } from "../interfaces/Storage.interface";
import { StateName } from "../interfaces/State.interface";

export interface IBaseEventContext {
  agentName: AgentName;
  swarmName: SwarmName;
  storageName: StorageName;
  stateName: StateName;
}

export type EventSource =
  | "agent"
  | "history"
  | "session"
  | "state"
  | "storage"
  | "swarm";

export interface IBaseEvent {
  type: string;
  source: EventSource;
  input: Record<string, any>;
  output: Record<string, any>;
  context: Partial<IBaseEventContext>;
}

export default IBaseEvent;
