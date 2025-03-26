import { Adapter, addAgent, addCompletion, addSwarm, addTool, changeToAgent, changeToDefaultAgent, commitToolOutputForce, executeForce, setConfig } from "agent-swarm-kit";
import { str } from "functools-kit";
import OpenAI from "openai";

setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
});

export const OPENAI_COMPLETION = addCompletion({
    completionName: "openai_completion",
    getCompletion: Adapter.fromOpenAI(new OpenAI({ apiKey: process.env.CC_OPENAI_API_KEY }))
});

export const NAVIGATION_PROMPT = str.newline([
    "Agent Navigation Guidelines:",
    "- If the query relates to technology trends, navigate to Tech Trends Agent",
    "- For cybersecurity concerns, direct to Cybersecurity Agent",
    "- Environmental topics should be routed to Environmental Awareness Agent",
    "- Health and wellness questions go to Health Agent",
    "- Financial inquiries are handled by Financial Literacy Agent",
]);

export const NAVIGATE_TO_TECH_TRENDS = addTool({
    docNote: "This tool facilitates navigation to the Tech Trends Agent when a user query involves emerging technologies or industry innovations, passing optional context to ensure the agent has relevant background information for a seamless transition.",
    toolName: "navigate_to_tech_trends_tool",
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(NAVIGATE_TO_TECH_TRENDS, { params });
        await commitToolOutputForce(toolId, "Navigation to Tech Trends Agent successful", clientId);
        await changeToAgent(TECH_TRENDS_AGENT, clientId);
        await executeForce(params?.context ? `Continue conversation with user based on the next context : ${params?.context}` : "Continue conversation with user", clientId);
    },
    function: {
        name: "navigate_to_tech_trends_tool",
        description: "Switch to the Tech Trends Agent to assist the user with technology-related queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the Tech Trends Agent"
                }
            },
            required: [],
        },
    },
});

export const NAVIGATE_TO_TRIAGE = addTool({
    docNote: "This tool enables returning to the Triage Agent from any specialized agent, making it useful for reassessing user requests or redirecting to another agent while supporting context for improved answer after routing.",
    toolName: "navigate_to_triage_tool",
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(NAVIGATE_TO_TRIAGE, { params });
        await commitToolOutputForce(toolId, "Navigation to Triage Agent successful", clientId);
        await changeToDefaultAgent(clientId);
        await executeForce(params?.context ? `Continue conversation with user based on the next context : ${params?.context}` : "Continue conversation with user", clientId);
    },
    function: {
        name: "navigate_to_triage_tool",
        description: "Return to the Triage Agent to reassess and route the user's request.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass back to the Triage Agent"
                }
            },
            required: [],
        },
    },
});

export const NAVIGATE_TO_CYBERSECURITY = addTool({
    docNote: "This tool directs the user to the Cybersecurity Agent for security-related inquiries, ideal for topics like online safety or data breaches, and includes optional context to provide the agent with query-specific details for a tailored response.",
    toolName: "navigate_to_cybersecurity_tool",
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(NAVIGATE_TO_CYBERSECURITY, { params });
        await commitToolOutputForce(toolId, "Navigation to Cybersecurity Agent successful", clientId);
        await changeToAgent(CYBERSECURITY_AGENT, clientId);
        await executeForce(params?.context ? `Continue conversation with user based on the next context : ${params?.context}` : "Continue conversation with user", clientId);
    },
    function: {
        name: "navigate_to_cybersecurity_tool",
        description: "Switch to the Cybersecurity Agent to assist with online safety and security queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the Cybersecurity Agent"
                }
            },
            required: [],
        },
    },
});

export const NAVIGATE_TO_ENVIRONMENT = addTool({
    docNote: "This tool routes queries to the Environmental Awareness Agent, designed for discussions on sustainability or conservation efforts, allowing context to be passed to tailor the agent's response to the user's specific environmental needs.",
    toolName: "navigate_to_environment_tool",
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(NAVIGATE_TO_ENVIRONMENT, { params });
        await commitToolOutputForce(toolId, "Navigation to Environmental Awareness Agent successful", clientId);
        await changeToAgent(ENVIRONMENT_AGENT, clientId);
        await executeForce(params?.context ? `Continue conversation with user based on the next context : ${params?.context}` : "Continue conversation with user", clientId);
    },
    function: {
        name: "navigate_to_environment_tool",
        description: "Switch to the Environmental Awareness Agent to discuss sustainability and conservation.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the Environmental Agent"
                }
            },
            required: [],
        },
    },
});

export const NAVIGATE_TO_HEALTH = addTool({
    docNote: "This tool navigates to the Health Agent for wellness and health-related topics like fitness or nutrition, with context optionally passed to ensure the response aligns with the user's specific inquiry for a more personalized interaction.",
    toolName: "navigate_to_health_tool",
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(NAVIGATE_TO_HEALTH, { params });
        await commitToolOutputForce(toolId, "Navigation to Health Agent successful", clientId);
        await changeToAgent(HEALTH_AGENT, clientId);
        await executeForce(params?.context ? `Continue conversation with user based on the next context : ${params?.context}` : "Continue conversation with user", clientId);
    },
    function: {
        name: "navigate_to_health_tool",
        description: "Switch to the Health Agent to discuss wellness and health-related topics.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the Health Agent"
                }
            },
            required: [],
        },
    },
});

export const NAVIGATE_TO_FINANCE = addTool({
    docNote: "This tool directs users to the Financial Literacy Agent for guidance on budgeting or investments, supporting context passing to provide the agent with relevant details for effective financial advice tailored to the user's needs.",
    toolName: "navigate_to_finance_tool",
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(NAVIGATE_TO_FINANCE, { params });
        await commitToolOutputForce(toolId, "Navigation to Financial Literacy Agent successful", clientId);
        await changeToAgent(FINANCE_AGENT, clientId);
        await executeForce(params?.context ? `Continue conversation with user based on the next context : ${params?.context}` : "Continue conversation with user", clientId);
    },
    function: {
        name: "navigate_to_finance_tool",
        description: "Switch to the Financial Literacy Agent to discuss financial planning and advice.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the Finance Agent"
                }
            },
            required: [],
        },
    },
});

export const TECH_TRENDS_AGENT = addAgent({
    docDescription: "This agent specializes in providing insights into current and emerging technology trends, with expertise in areas like artificial intelligence and blockchain, aiming to deliver actionable, industry-aligned advice for tech enthusiasts and professionals while offering navigation back to the Triage Agent for queries outside its scope.",
    agentName: "tech_trends_agent",
    completion: OPENAI_COMPLETION,
    system: [
        str.newline([
            "Technology Trends Agent:",
            "- Provides insights into the latest technology trends.",
            "- Focuses on general information about AI, blockchain, IoT, and more.",
        ]),
        NAVIGATION_PROMPT,
    ],
    prompt: str.newline([
        `You are an expert Technology Trends consultant.`,
        "Provide a helpful, professional, and insightful response.",
        "Ensure your answer is:",
        "- Accurate and well-researched",
        "- Tailored to the specific context of the query",
        "- Actionable and practical",
        "- Aligned with industry best practices",
    ]),
    tools: [NAVIGATE_TO_TRIAGE],
    dependsOn: [],
});

export const CYBERSECURITY_AGENT = addAgent({
    docDescription: "This agent focuses on educating users about online safety and cybersecurity best practices, covering topics like password management and phishing prevention, offering practical tips to enhance digital security, and including navigation to the Triage Agent for broader inquiries.",
    agentName: "cybersecurity_agent",
    completion: OPENAI_COMPLETION,
    system: [
        str.newline([
            "Cybersecurity Agent:",
            "- Shares general tips on staying safe online.",
            "- Covers topics like password security, phishing, and data protection.",
        ]),
        NAVIGATION_PROMPT,
    ],
    prompt: str.newline([
        `You are an expert Cybersecurity consultant.`,
        "Provide a helpful, professional, and insightful response.",
        "Ensure your answer is:",
        "- Accurate and well-researched",
        "- Tailored to the specific context of the query",
        "- Actionable and practical",
        "- Aligned with industry best practices",
    ]),
    tools: [NAVIGATE_TO_TRIAGE],
    dependsOn: [],
});

export const ENVIRONMENT_AGENT = addAgent({
    docDescription: "This agent is dedicated to promoting environmental awareness and sustainable living, providing guidance on reducing carbon footprints and waste management, offering practical advice for eco-friendly practices, and supporting navigation back to the Triage Agent for unrelated queries.",
    agentName: "environment_agent",
    completion: OPENAI_COMPLETION,
    system: [
        str.newline([
            "Environmental Awareness Agent:",
            "- Provides information on sustainable practices and environmental conservation.",
            "- Focuses on general advice for reducing carbon footprints and waste.",
        ]),
        NAVIGATION_PROMPT,
    ],
    prompt: str.newline([
        `You are an expert Environmental Awareness consultant.`,
        "Provide a helpful, professional, and insightful response.",
        "Ensure your answer is:",
        "- Accurate and well-researched",
        "- Tailored to the specific context of the query",
        "- Actionable and practical",
        "- Aligned with industry best practices",
    ]),
    tools: [NAVIGATE_TO_TRIAGE],
    dependsOn: [],
});

export const HEALTH_AGENT = addAgent({
    docDescription: "This agent specializes in health and wellness, offering general advice on topics like fitness and nutrition, aiming to provide actionable steps for improving personal health, and capable of redirecting to the Triage Agent if a different expertise is required.",
    agentName: "health_agent",
    completion: OPENAI_COMPLETION,
    system: [
        str.newline([
            "Health and Wellness Agent:",
            "- Shares general tips on maintaining physical and mental health.",
            "- Covers topics like exercise, nutrition, and stress management.",
        ]),
        NAVIGATION_PROMPT,
    ],
    prompt: str.newline([
        `You are an expert Health and Wellness consultant.`,
        "Provide a helpful, professional, and insightful response.",
        "Ensure your answer is:",
        "- Accurate and well-researched",
        "- Tailored to the specific context of the query",
        "- Actionable and practical",
        "- Aligned with industry best practices",
    ]),
    tools: [NAVIGATE_TO_TRIAGE],
    dependsOn: [],
});

export const FINANCE_AGENT = addAgent({
    docDescription: "This agent offers expertise in financial literacy and money management, providing advice on budgeting and investments to enhance users' financial knowledge, and includes an option to return to the Triage Agent for non-financial queries.",
    agentName: "finance_agent",
    completion: OPENAI_COMPLETION,
    system: [
        str.newline([
            "Financial Literacy Agent:",
            "- Provides general advice on budgeting, saving, and investing.",
            "- Focuses on improving financial knowledge.",
        ]),
        NAVIGATION_PROMPT,
    ],
    prompt: str.newline([
        `You are an expert Financial Literacy consultant.`,
        "Provide a helpful, professional, and insightful response.",
        "Ensure your answer is:",
        "- Accurate and well-researched",
        "- Tailored to the specific context of the query",
        "- Actionable and practical",
        "- Aligned with industry best practices",
    ]),
    tools: [NAVIGATE_TO_TRIAGE],
    dependsOn: [],
});

export const TRIAGE_AGENT = addAgent({
    docDescription: "This agent acts as the central routing hub for incoming user requests, analyzing queries to identify the most suitable specialized agent, ensuring smooth transitions by passing relevant context, and serving as the default starting point equipped with tools to navigate to any specialized agent.",
    agentName: "triage_agent",
    completion: OPENAI_COMPLETION,
    system: [
        str.newline([
            "Triage Agent:",
            "- Carefully analyze incoming user requests.",
            "- Determine the most appropriate specialized agent to handle the query.",
            "- Provide context and key details to the selected agent.",
            "- Ensure smooth routing of requests across different domains.",
        ]),
        NAVIGATION_PROMPT,
    ],
    prompt: str.newline([
        "Analyze the following user request and determine the most suitable agent:",
        "",
        "Routing Guidelines:",
        "- Technology Trends: AI, emerging tech, innovation",
        "- Cybersecurity: Online safety, data protection, security practices",
        "- Environmental Awareness: Sustainability, green tech, conservation",
        "- Health and Wellness: Physical and mental health, workplace well-being",
        "- Financial Literacy: Budgeting, investing, financial planning",
        "",
        "Output the exact agent name that best matches the request.",
    ]),
    dependsOn: [
        TECH_TRENDS_AGENT,
        CYBERSECURITY_AGENT,
        ENVIRONMENT_AGENT,
        HEALTH_AGENT,
        FINANCE_AGENT
    ],
    tools: [
        NAVIGATE_TO_TECH_TRENDS,
        NAVIGATE_TO_CYBERSECURITY,
        NAVIGATE_TO_ENVIRONMENT,
        NAVIGATE_TO_HEALTH,
        NAVIGATE_TO_FINANCE
    ],
});

export const ROOT_SWARM = addSwarm({
    docDescription: "This swarm serves as the root structure for a multi-agent system with specialized roles, managing a collection of agents tailored to specific domains, utilizing the Triage Agent as the entry point for request analysis, and designed to handle diverse queries across technology, security, environment, health, and finance for seamless user support.",
    swarmName: "root_swarm",
    agentList: [
        TECH_TRENDS_AGENT,
        CYBERSECURITY_AGENT,
        ENVIRONMENT_AGENT,
        HEALTH_AGENT,
        FINANCE_AGENT,
        TRIAGE_AGENT,
    ],
    defaultAgent: TRIAGE_AGENT,
});
