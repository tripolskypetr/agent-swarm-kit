import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StorageName } from "../interfaces/Storage.interface";
import { StateName } from "../interfaces/State.interface";

/**
 * Interface representing the base context for an event.
 */
export interface IBaseEventContext {
  /**
   * The name of the agent.
   */
  agentName: AgentName;

  /**
   * The name of the swarm.
   */
  swarmName: SwarmName;

  /**
   * The name of the storage.
   */
  storageName: StorageName;

  /**
   * The name of the state.
   */
  stateName: StateName;
}

/**
 * Type representing the possible sources of an event.
 */
export type EventSource = string;

/**
 * Interface representing the base structure of an event.
 */
export interface IBaseEvent {
  /**
   * The source of the event.
   */
  source: EventSource;
}

export interface IBusEvent extends IBaseEvent {
  /**
   * The type of the event.
   */
  type: string;

  /**
   * The input data for the event.
   */
  input: Record<string, any>;

  /**
   * The output data for the event.
   */
  output: Record<string, any>;

  /**
   * The context of the event.
   */
  context: Partial<IBaseEventContext>;
}

export interface ICustomEvent<T extends any = any> extends IBaseEvent {
  /**
   * The payload of the event, if any.
   */
  payload?: T;
}

export default IBaseEvent;
