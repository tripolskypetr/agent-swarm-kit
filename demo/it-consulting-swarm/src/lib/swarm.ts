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
    docNote: str.newline([
        "Tool Purpose:",
        "- Facilitates navigation to the Tech Trends Agent.",
        "- Used when a user query involves emerging technologies or industry innovations.",
        "- Passes optional context to ensure the agent has relevant background information."
    ]),
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
    docNote: str.newline([
        "Tool Purpose:",
        "- Enables returning to the Triage Agent from any specialized agent.",
        "- Useful for reassessing user requests or redirecting to another agent.",
        "- Supports passing context or a specific destination reason for improved routing."
    ]),
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
                destination: {
                    type: "string",
                    description: "Optional specific destination or reason for returning to triage"
                },
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
    docNote: str.newline([
        "Tool Purpose:",
        "- Directs the user to the Cybersecurity Agent for security-related inquiries.",
        "- Ideal for topics like online safety, data breaches, or secure practices.",
        "- Includes optional context to provide the agent with query-specific details."
    ]),
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
    docNote: str.newline([
        "Tool Purpose:",
        "- Routes queries to the Environmental Awareness Agent.",
        "- Designed for discussions on sustainability, eco-friendly practices, or conservation efforts.",
        "- Allows passing context to tailor the agent's response to the user's needs."
    ]),
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
    docNote: str.newline([
        "Tool Purpose:",
        "- Navigates to the Health Agent for wellness and health-related topics.",
        "- Suitable for queries on fitness, mental health, or nutrition advice.",
        "- Context can be passed to ensure the response aligns with the user's specific inquiry."
    ]),
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
    docNote: str.newline([
        "Tool Purpose:",
        "- Directs users to the Financial Literacy Agent for financial guidance.",
        "- Covers topics like budgeting, investment options, or money management.",
        "- Supports context passing to provide the agent with relevant user details."
    ]),
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
    docDescription: str.newline([
        "Agent Overview:",
        "- Specializes in providing insights into current and emerging technology trends.",
        "- Expertise includes artificial intelligence, blockchain, Internet of Things (IoT), and more.",
        "- Aims to deliver actionable, industry-aligned advice for tech enthusiasts and professionals.",
        "- Can navigate back to Triage Agent if the query falls outside its scope."
    ]),
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
    docDescription: str.newline([
        "Agent Overview:",
        "- Focuses on educating users about online safety and cybersecurity best practices.",
        "- Covers topics such as password management, phishing prevention, and data protection.",
        "- Offers practical tips to enhance digital security in personal and professional contexts.",
        "- Includes navigation to Triage Agent for misrouted or broader inquiries."
    ]),
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
    docDescription: str.newline([
        "Agent Overview:",
        "- Dedicated to promoting environmental awareness and sustainable living.",
        "- Provides guidance on reducing carbon footprints, waste management, and green technologies.",
        "- Offers practical advice for individuals and organizations to adopt eco-friendly practices.",
        "- Supports navigation back to Triage Agent for unrelated queries."
    ]),
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
    docDescription: str.newline([
        "Agent Overview:",
        "- Specializes in health and wellness, offering general advice for well-being.",
        "- Topics include physical fitness, mental health strategies, and nutritional guidance.",
        "- Aims to provide actionable steps for improving personal health in daily life.",
        "- Can redirect to Triage Agent if the query requires a different expertise."
    ]),
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
    docDescription: str.newline([
        "Agent Overview:",
        "- Offers expertise in financial literacy and personal money management.",
        "- Provides advice on budgeting, saving strategies, and basic investment principles.",
        "- Designed to enhance users' financial knowledge and decision-making skills.",
        "- Includes an option to return to Triage Agent for non-financial queries."
    ]),
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
    docDescription: str.newline([
        "Agent Overview:",
        "- Acts as the central routing hub for incoming user requests.",
        "- Analyzes queries to identify the most suitable specialized agent based on content.",
        "- Ensures smooth transitions between agents by passing relevant context.",
        "- Equipped with tools to navigate to any specialized agent as needed.",
        "- Default starting point for all interactions within the swarm."
    ]),
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
    docDescription: str.newline([
        "Swarm Overview:",
        "- Serves as the root structure for a multi-agent system with specialized roles.",
        "- Manages a collection of agents, each tailored to a specific domain of expertise.",
        "- Utilizes a Triage Agent as the default entry point for request analysis and routing.",
        "- Designed to handle diverse user queries across technology, security, environment, health, and finance.",
        "- Ensures seamless interaction and coordination between agents for optimal user support."
    ]),
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
