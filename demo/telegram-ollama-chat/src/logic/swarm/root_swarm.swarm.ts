import { addSwarm } from "agent-swarm-kit";
import { TRIAGE_AGENT } from "../agent/triage.agent";
import { SALES_AGENT } from "../agent/sales.agent";

export const ROOT_SWARM = addSwarm({
    swarmName: 'root_swarm',
    agentList: [
        TRIAGE_AGENT,
        SALES_AGENT,
    ],
    defaultAgent: TRIAGE_AGENT,
});
