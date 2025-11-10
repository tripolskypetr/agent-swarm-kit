import { IBaseCompletionArgs } from "./BaseCompletion.contract";
import { AgentName } from "../interfaces/Agent.interface";
import { ITool } from "../model/Tool.model";
import { ISwarmMessage, SwarmMessageRole } from "./SwarmMessage.contract";
import { ExecutionMode } from "../interfaces/Session.interface";

/**
 * Interface representing the arguments for swarm (chat) completions.
 * Extends base completion args with swarm-specific fields for agent-based interactions.
 * Used for agent completions with tool support, client tracking, and multi-agent context.
 * @interface ISwarmCompletionArgs
 */
export interface ISwarmCompletionArgs extends IBaseCompletionArgs<ISwarmMessage> {
  /**
   * The agent name (required).
   * Identifies the agent context for the completion.
   */
  agentName: AgentName;

  /** The source of the last message, indicating whether it originated from a tool or user.*/
  mode: ExecutionMode;

  /**
   * Optional array of tools available for this completion.
   * Enables the model to call functions and interact with external systems.
   */
  tools?: ITool[];
}
