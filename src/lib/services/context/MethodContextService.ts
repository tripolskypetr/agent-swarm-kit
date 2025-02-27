import { scoped } from "di-scoped";
import { AgentName } from "../../../interfaces/Agent.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { StorageName } from "../../../interfaces/Storage.interface";
import { StateName } from "../../../interfaces/State.interface";

/**
 * Interface representing the context.
 */
export interface IMethodContext {
  clientId: string;
  methodName: string;
  agentName: AgentName;
  swarmName: SwarmName;
  storageName: StorageName;
  stateName: StateName;
}

/**
 * Service providing method call context information.
 */
export const MethodContextService = scoped(
  class {
    /**
     * Creates an instance of MethodContextService.
     * @param {IMethodContext} context - The context object.
     */
    constructor(readonly context: IMethodContext) {}
  }
);

/**
 * Type representing an instance of MethodContextService.
 */
export type TMethodContextService = InstanceType<typeof MethodContextService>;

export default MethodContextService;
