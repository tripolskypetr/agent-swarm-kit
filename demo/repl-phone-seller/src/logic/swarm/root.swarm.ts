import { addSwarm } from "agent-swarm-kit";
import { SwarmName } from "../enum/SwarmName";
import { AgentName } from "../enum/AgentName";

addSwarm({
    docDescription: "This swarm serves as the root structure for the repl-phone-seller project, managing a single SalesAgent as both the sole member and default agent to assist users in adding phones to a cart via a REPL terminal, utilizing the OllamaCompletion for natural interactions while leveraging tools and storages to handle phone searches and basket management.",
    swarmName: SwarmName.RootSwarm,
    agentList: [
        AgentName.SalesAgent,
    ],
    defaultAgent: AgentName.SalesAgent,
});
