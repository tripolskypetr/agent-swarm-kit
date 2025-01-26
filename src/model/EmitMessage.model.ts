import { AgentName } from "../interfaces/Agent.interface";

/**
 * Interface representing an incoming message.
 */
export interface IIncomingMessage {
  /**
   * The ID of the client sending the message.
   */
  clientId: string;
  
  /**
   * The data contained in the message.
   */
  data: string;
  
  /**
   * The name of the agent sending the message.
   */
  agentName: AgentName;
}

/**
 * Interface representing an outgoing message.
 */
export interface IOutgoingMessage {
  /**
   * The ID of the client receiving the message.
   */
  clientId: string;
  
  /**
   * The data contained in the message.
   */
  data: string;
  
  /**
   * The name of the agent sending the message.
   */
  agentName: AgentName;
}
