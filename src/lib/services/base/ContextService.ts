import { scoped } from "di-scoped";
import { AgentName } from "../../../interfaces/Agent.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";

/**
 * Interface representing the context.
 */
export interface IContext {
  clientId: string;
  agentName: AgentName;
  swarmName: SwarmName;
}

/**
 * Service providing context information.
 */
export const ContextService = scoped(
  class {
    /**
     * Creates an instance of ContextService.
     * @param {IContext} context - The context object.
     */
    constructor(readonly context: IContext) {}
  }
);

/**
 * Type representing an instance of ContextService.
 */
export type TContextService = InstanceType<typeof ContextService>;

export default ContextService;
