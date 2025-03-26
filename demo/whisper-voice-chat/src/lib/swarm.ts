import {
    addAgent,
    addCompletion,
    addSwarm,
    Adapter,
} from "agent-swarm-kit";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

export const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: Adapter.fromOllama(ollama, "nemotron-mini:4b"),
});

export const TEST_AGENT = addAgent({
    docDescription: "This agent, named test-agent, operates within the whisper-voice-chat project to engage in voice-based chats with users, leveraging the navigate-completion with nemotron-mini:4b via Ollama to process transcribed audio inputs from the Whisper model and provide conversational responses.",
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "You are the agent of a swarm system. Chat with customer",
    dependsOn: [],
});

export const TEST_SWARM = addSwarm({
    docDescription: "This swarm serves as the core structure for the whisper-voice-chat project, managing a single test-agent as both the sole member and default agent to handle voice interactions, utilizing the navigate-completion with nemotron-mini:4b via Ollama to respond to user speech transcribed by Whisper in real-time.",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    swarmName: "test-swarm",
});