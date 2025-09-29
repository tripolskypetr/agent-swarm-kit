import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StorageName } from "../interfaces/Storage.interface";
import { StateName } from "../interfaces/State.interface";
import { PolicyName } from "../interfaces/Policy.interface";
import { ComputeName } from "../interfaces/Compute.interface";

/**
 * Interface representing the contextual metadata for an event in the swarm system.
 * Provides optional identifiers for components involved in an event (e.g., agent, swarm, storage), used partially in IBusEvent.context to supply additional context.
 * In ClientAgent, typically only agentName is populated (e.g., context: { agentName }), with other fields available for broader system use (e.g., swarm or policy events).
 */
export interface IBusEventContext {
  /**
   * The unique name of the agent associated with the event.
   * Links the event to a specific agent instance (e.g., this.params.agentName in ClientAgent), consistently included in IBusEvent.context.
   * Example: "Agent1" for an agent emitting a "run" event.
   *    */
  agentName: AgentName;

  /**
   * The unique name of the swarm associated with the event.
   * Identifies the swarm context, potentially used in swarm-wide events (e.g., IBus.emit in ISwarmParams), though not observed in ClientAgent.
   * Example: "SwarmA" for a swarm-level navigation event.
   *    */
  swarmName: SwarmName;

  /**
   * The unique name of the storage associated with the event.
   * Ties the event to a specific storage instance (e.g., IStorage), potentially for storage-related events, unused in ClientAgent’s agent-centric emissions.
   * Example: "Storage1" for a storage upsert event.
   *    */
  storageName: StorageName;

  /**
   * The unique name of the state associated with the event.
   * Links to a specific state instance (e.g., IState), potentially for state change events, not populated in ClientAgent’s context.
   * Example: "StateX" for a state update event.
   *    */
  stateName: StateName;

  /**
   * The unique name of the compute associated with the event.
   * Links to a specific compute instance (e.g., ICompute), potentially for compute events, not populated in ClientAgent’s context.
   * Example: "ComputeX" for a compute update event.
   *    */
  computeName: ComputeName;

  /**
   * The unique name of the policy associated with the event.
   * Identifies the policy context (e.g., IPolicy), potentially for policy enforcement events (e.g., bans), unused in ClientAgent’s emissions.
   * Example: "PolicyY" for a client ban event.
   *    */
  policyName: PolicyName;
}

/**
 * Type representing the possible sources of an event in the swarm system.
 * A generic string identifier for the event’s origin, used in IBaseEvent.source and overridden by EventBusSource in IBusEvent for specific bus-related sources.
 * Example: "custom-source" for a generic event, though typically refined by EventBusSource in practice.
 *  */
export type EventSource = string;

/**
 * Type representing specific sources of events for the internal bus in the swarm system.
 * Enumerates predefined origins for IBusEvent.source, observed as "agent-bus" in ClientAgent (e.g., bus.emit calls), with other values likely used in corresponding components (e.g., "history-bus" in IHistory).
 *  */
export type EventBusSource =
  | "agent-bus"
  | "history-bus"
  | "session-bus"
  | "state-bus"
  | "storage-bus"
  | "swarm-bus"
  | "execution-bus"
  | "policy-bus"
  | "compute-bus";

/**
 * Interface representing the base structure of an event in the swarm system.
 * Defines the minimal required fields for all events, extended by IBusEvent and ICustomEvent for specific use cases, and used generically in IBus.emit<T>.
 * Provides a foundation for event-driven communication across components like agents, sessions, and swarms.
 */
export interface IBaseEvent {
  /**
   * The source of the event, identifying its origin within the system.
   * A generic string (EventSource) in IBaseEvent, overridden by EventBusSource in IBusEvent (e.g., "agent-bus" in ClientAgent).
   * Example: "custom-source" for a basic event, or "agent-bus" in practice.
   *    */
  source: EventSource;

  /**
   * The unique identifier of the client targeted by the event.
   * Matches the clientId used in runtime params (e.g., this.params.clientId in ClientAgent), ensuring events reach the intended session or agent instance.
   * Example: "client-123" for a user session receiving an "emit-output" event.
   *    */
  clientId: string;
}

/**
 * Interface representing a structured event for the internal bus in the swarm system.
 * Extends IBaseEvent with a specific schema, used extensively in ClientAgent’s bus.emit calls (e.g., "run", "commit-user-message") to notify the system of actions, outputs, or state changes.
 * Dispatched via IBus.emit<IBusEvent> to broadcast detailed, agent-driven events with input/output data and context.
 */
export interface IBusEvent
  extends Omit<
    IBaseEvent,
    keyof {
      source: never;
    }
  > {
  /**
   * The specific source of the event, restricted to EventBusSource values.
   * Identifies the component emitting the event, consistently "agent-bus" in ClientAgent (e.g., RUN_FN, _emitOutput), with other values for other buses (e.g., "history-bus").
   * Example: "agent-bus" for an agent’s "emit-output" event.
   *    */
  source: EventBusSource;

  /**
   * The type of the event, defining its purpose or action.
   * A string identifier unique to the event’s intent, observed in ClientAgent as "run", "emit-output", "commit-user-message", etc.
   * Example: "commit-tool-output" for a tool execution result.
   *    */
  type: string;

  /**
   * The input data for the event, as a key-value object.
   * Carries event-specific input (e.g., { message } in "commit-user-message", { mode, rawResult } in "emit-output" from ClientAgent), often tied to IModelMessage content.
   * Example: { toolId: "tool-xyz", content: "result" } for a tool output event.
   *    */
  input: Record<string, any>;

  /**
   * The output data for the event, as a key-value object.
   * Contains event-specific results (e.g., { result } in "run" or "emit-output" from ClientAgent), often empty {} for notifications (e.g., "commit-flush").
   * Example: { result: "processed data" } for an execution output.
   *    */
  output: Record<string, any>;

  /**
   * The contextual metadata for the event, partially implementing IBusEventContext.
   * Typically includes only agentName in ClientAgent (e.g., { agentName: this.params.agentName }), with other fields optional for broader use cases.
   * Example: { agentName: "Agent1" } for an agent-driven event.
   *    */
  context: Partial<IBusEventContext>;
}

/**
 * Interface representing a custom event with a flexible payload in the swarm system.
 * Extends IBaseEvent for generic event handling, allowing arbitrary data via payload, though not directly observed in ClientAgent (which uses IBusEvent).
 * Likely used for bespoke event scenarios outside the structured IBusEvent schema, dispatched via IBus.emit<ICustomEvent>.
 */
export interface ICustomEvent<T extends any = any> extends IBaseEvent {
  /**
   * The optional payload of the event, carrying custom data of any type.
   * Provides flexibility for event-specific information, unlike IBusEvent’s rigid input/output structure, potentially for user-defined events.
   * Example: { status: "complete", data: 42 } for a custom completion event.
   *    *    */
  payload?: T;
}

/**
 * Default export of the IBaseEvent interface.
 * Represents the foundational event structure for the module, extended by IBusEvent and ICustomEvent for specific event handling in the swarm system.
 *  */
export default IBaseEvent;
