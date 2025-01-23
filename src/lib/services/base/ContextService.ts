import { scoped } from "di-scoped";
import { AgentName } from "src/interfaces/Agent.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";

export interface IContext {
  clientId: string;
  agentName: AgentName;
  swarmName: SwarmName;
}

export const ContextService = scoped(
  class {
    constructor(readonly context: IContext) {}
  }
);

export type TContextService = InstanceType<typeof ContextService>;

export default ContextService;
