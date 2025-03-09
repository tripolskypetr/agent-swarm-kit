import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StorageName } from "../interfaces/Storage.interface";
import { StateName } from "../interfaces/State.interface";
import { PolicyName } from "../interfaces/Policy.interface";

/**
 * Interface representing the base context for an event.
 */
export interface IBusEventContext {
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

  /**
   * The name of the policy
   */
  policyName: PolicyName;
}

/**
 * Type representing the possible sources of an event.
 */
export type EventSource = string;

/**
 * Type representing the possible sources of an event for the internal bus.
 */
export type EventBusSource =
  | "agent-bus"
  | "history-bus"
  | "session-bus"
  | "state-bus"
  | "storage-bus"
  | "swarm-bus"
  | "execution-bus"
  | "policy-bus";

/**
 * Interface representing the base structure of an event.
 */
export interface IBaseEvent {
  /**
   * The source of the event.
   */
  source: EventSource;

  /**
   * The client id
   */
  clientId: string;
}

export interface IBusEvent
  extends Omit<
    IBaseEvent,
    keyof {
      source: never;
    }
  > {
  /**
   * The source of the event.
   */
  source: EventBusSource;

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
  context: Partial<IBusEventContext>;
}

export interface ICustomEvent<T extends any = any> extends IBaseEvent {
  /**
   * The payload of the event, if any.
   */
  payload?: T;
}

export default IBaseEvent;
