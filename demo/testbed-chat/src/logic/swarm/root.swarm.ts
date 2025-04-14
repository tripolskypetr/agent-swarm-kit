import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
    docDescription:
        "This swarm, named RootSwarm, is the core structure for the repl-phone-seller project's testbed environment using worker-testbed with the WorkerThreads API and tape. It manages a single SalesAgent as both the sole member and default agent, designed to mock tool calls for validation, passing tests when tools (e.g., AddToBacketTool) are called correctly and failing otherwise. It utilizes OpenAI for natural interactions, coordinating tools and storages to handle phone searches and basket management.",
    swarmName: SwarmName.RootSwarm,
    agentList: [
        AgentName.SalesAgent,
    ],
    defaultAgent: AgentName.SalesAgent,
});