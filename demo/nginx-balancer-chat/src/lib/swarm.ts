import { Adapter, addAgent, addCompletion, addSwarm } from "agent-swarm-kit";
import { OpenAI } from "openai";

export const OPENAI_COMPLETION = addCompletion({
  completionName: "openai_completion",
  getCompletion: Adapter.fromOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
});

export const TEST_AGENT = addAgent({
  docDescription: "This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of 5 chat instances running on different ports and upstreamed by Nginx to port 80, extracting the port details from the chat history’s system message.",
  agentName: "test_agent",
  completion: OPENAI_COMPLETION,
  prompt: `You are a test agent for Nginx Upstream. Tell user the server port from the chat history (system message)`,
  dependsOn: [],
});

export const TEST_SWARM = addSwarm({
  docDescription: "This swarm serves as the core structure for the nginx-balancer-chat project, managing a single TestAgent as both the sole member and default agent to handle user interactions, leveraging the CohereCompletion to report the specific port of one of 5 upstreamed chat instances balanced by Nginx to port 80.",
  swarmName: "test_swarm",
  agentList: [TEST_AGENT],
  defaultAgent: TEST_AGENT,
});
