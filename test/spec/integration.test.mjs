import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCompletion,
  addMCP,
  addSwarm,
  addTool,
  changeToAgent,
  commitToolOutput,
  executeForce,
  getAgentName,
  getNavigationRoute,
  session,
  setConfig,
  Operator,
  OperatorInstance,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

// One integration surface exercised end to end: a triage router with three
// navigation tools hands off to a plain-tool sales agent, an MCP-tool tech
// agent, or a human operator, and the conversation returns via changeToAgent.
// A single if-branching mock drives every agent's completion.
const buildSupportSwarm = () => {
  const events = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "int-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      const text = last.content;

      if (agentName === "int-triage") {
        if (text === "i want to buy") {
          return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "nav-to-sales", arguments: {} } }] };
        }
        if (text === "my device is broken") {
          return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "nav-to-tech", arguments: {} } }] };
        }
        if (text === "let me speak to a human") {
          return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "nav-to-human", arguments: {} } }] };
        }
        return { agentName, content: `triage:${text}`, role: "assistant" };
      }

      if (agentName === "int-sales") {
        if (text === "i want to buy") {
          return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "make-quote", arguments: { sku: "X1" } } }] };
        }
        return { agentName, content: `sales:${text}`, role: "assistant" };
      }

      if (agentName === "int-tech") {
        if (text === "my device is broken") {
          return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "mcp_diagnose", arguments: { code: 42 } } }] };
        }
        return { agentName, content: `tech:${text}`, role: "assistant" };
      }

      return { agentName, content: `echo:${agentName}:${text}`, role: "assistant" };
    },
  });

  const SALES_AGENT = addAgent({
    agentName: "int-sales",
    completion: MOCK_COMPLETION,
    prompt: "You are the sales agent",
    tools: ["make-quote"],
  });
  const TECH_AGENT = addAgent({
    agentName: "int-tech",
    completion: MOCK_COMPLETION,
    prompt: "You are the tech agent",
    mcp: ["int-mcp"],
  });
  const HUMAN_AGENT = addAgent({
    agentName: "int-human",
    completion: MOCK_COMPLETION,
    operator: true,
    prompt: "",
  });

  addMCP({
    mcpName: "int-mcp",
    listTools: async () => [
      {
        name: "mcp_diagnose",
        description: "Run device diagnostics",
        inputSchema: { type: "object", properties: { code: { type: "number" } }, required: ["code"] },
      },
    ],
    callTool: async (toolName, { toolId, clientId, params }) => {
      events.push(`mcp-called:${toolName}:${params.code}`);
      await commitToolOutput(toolId, `diagnosis-for-${params.code}`, clientId, TECH_AGENT);
      await executeForce("diagnosis complete", clientId);
    },
  });

  addTool({
    toolName: "make-quote",
    validate: () => true,
    type: "function",
    function: {
      name: "make-quote",
      description: "Produce a price quote",
      parameters: { type: "object", properties: { sku: { type: "string" } }, required: ["sku"] },
    },
    call: async ({ toolId, clientId, agentName, params }) => {
      events.push(`quote-called:${params.sku}`);
      await commitToolOutput(toolId, `quote-${params.sku}-$100`, clientId, agentName);
      await executeForce("here is your quote", clientId);
    },
  });

  const NAV_SALES = addAgentNavigation({ toolName: "nav-to-sales", description: "Route to sales", navigateTo: SALES_AGENT });
  const NAV_TECH = addAgentNavigation({ toolName: "nav-to-tech", description: "Route to tech support", navigateTo: TECH_AGENT });
  const NAV_HUMAN = addAgentNavigation({ toolName: "nav-to-human", description: "Route to a human operator", navigateTo: HUMAN_AGENT });

  const TRIAGE_AGENT = addAgent({
    agentName: "int-triage",
    completion: MOCK_COMPLETION,
    prompt: "You are triage. Route the user.",
    tools: [NAV_SALES, NAV_TECH, NAV_HUMAN],
    dependsOn: [SALES_AGENT, TECH_AGENT, HUMAN_AGENT],
  });

  const SUPPORT_SWARM = addSwarm({
    swarmName: "int-swarm",
    agentList: [TRIAGE_AGENT, SALES_AGENT, TECH_AGENT, HUMAN_AGENT],
    defaultAgent: TRIAGE_AGENT,
  });

  Operator.useOperatorAdapter(
    class extends OperatorInstance {
      async recieveMessage(message) {
        await super.recieveMessage(message);
        events.push(`operator-received:${message}`);
        setTimeout(() => this.answer(`human-says: handled "${message}"`), 15);
      }
    }
  );

  return { events, SUPPORT_SWARM, TRIAGE_AGENT, SALES_AGENT, TECH_AGENT, HUMAN_AGENT };
};

test("Will route via navigation and call a plain tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { events, SUPPORT_SWARM, SALES_AGENT } = buildSupportSwarm();

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SUPPORT_SWARM);
  const answer = await chatSession.complete("i want to buy");
  const active = await getAgentName(CLIENT_ID);
  const route = [...getNavigationRoute(CLIENT_ID, SUPPORT_SWARM)];
  await chatSession.dispose();

  const ok =
    active === SALES_AGENT &&
    route.includes(SALES_AGENT) &&
    events.includes("quote-called:X1") &&
    answer === "sales:here is your quote";

  if (ok) {
    pass();
    return;
  }
  fail(`active=${active} route=${JSON.stringify(route)} answer=${answer}`);
});

test("Will route via navigation and call an MCP tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { events, SUPPORT_SWARM, TECH_AGENT } = buildSupportSwarm();

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SUPPORT_SWARM);
  const answer = await chatSession.complete("my device is broken");
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  const ok =
    active === TECH_AGENT &&
    events.includes("mcp-called:mcp_diagnose:42") &&
    answer === "tech:diagnosis complete";

  if (ok) {
    pass();
    return;
  }
  fail(`active=${active} answer=${answer} events=${JSON.stringify(events.filter((e) => e.startsWith("mcp")))}`);
});

test("Will route via navigation to a human operator", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { events, SUPPORT_SWARM, HUMAN_AGENT } = buildSupportSwarm();

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SUPPORT_SWARM);
  const answer = await chatSession.complete("let me speak to a human");
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();
  await sleep(50);

  const ok =
    active === HUMAN_AGENT &&
    events.some((e) => e.startsWith("operator-received:")) &&
    answer.startsWith("human-says: handled");

  if (ok) {
    pass();
    return;
  }
  fail(`active=${active} answer=${answer}`);
});

test("Will run a full multi-hop journey in one session", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { SUPPORT_SWARM, TRIAGE_AGENT, SALES_AGENT, TECH_AGENT, HUMAN_AGENT } = buildSupportSwarm();

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SUPPORT_SWARM);

  const r1 = await chatSession.complete("hello");
  const r2 = await chatSession.complete("i want to buy");
  const afterSales = await getAgentName(CLIENT_ID);
  await changeToAgent(TRIAGE_AGENT, CLIENT_ID);
  const backOnTriage = await getAgentName(CLIENT_ID);
  const r3 = await chatSession.complete("my device is broken");
  const afterTech = await getAgentName(CLIENT_ID);
  await changeToAgent(TRIAGE_AGENT, CLIENT_ID);
  const r4 = await chatSession.complete("let me speak to a human");
  const afterHuman = await getAgentName(CLIENT_ID);
  await chatSession.dispose();
  await sleep(50);

  const ok =
    r1 === "triage:hello" &&
    afterSales === SALES_AGENT &&
    r2 === "sales:here is your quote" &&
    backOnTriage === TRIAGE_AGENT &&
    afterTech === TECH_AGENT &&
    r3 === "tech:diagnosis complete" &&
    afterHuman === HUMAN_AGENT &&
    r4.startsWith("human-says: handled");

  if (ok) {
    pass();
    return;
  }
  fail(`r1=${r1} afterSales=${afterSales} r2=${r2} backOnTriage=${backOnTriage} afterTech=${afterTech} r3=${r3} afterHuman=${afterHuman} r4=${r4}`);
});

test("Will run two concurrent client journeys in isolation", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { SUPPORT_SWARM, SALES_AGENT, TECH_AGENT } = buildSupportSwarm();

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SUPPORT_SWARM);
  const sessionB = session(CLIENT_B, SUPPORT_SWARM);

  const [a, b] = await Promise.all([
    sessionA.complete("i want to buy"),
    sessionB.complete("my device is broken"),
  ]);
  const activeA = await getAgentName(CLIENT_A);
  const activeB = await getAgentName(CLIENT_B);
  await sessionA.dispose();
  await sessionB.dispose();

  const ok =
    a === "sales:here is your quote" &&
    b === "tech:diagnosis complete" &&
    activeA === SALES_AGENT &&
    activeB === TECH_AGENT;

  if (ok) {
    pass();
    return;
  }
  fail(`a=${a} b=${b} activeA=${activeA} activeB=${activeB}`);
});
