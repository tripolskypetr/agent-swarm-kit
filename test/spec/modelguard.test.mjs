import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitToolOutput,
  execute,
  executeForce,
  hasSession,
  session,
  setConfig,
  Chat,
  Operator,
  OperatorInstance,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

const addDupCompletion = (name, toolName) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { id: "dup", function: { name: toolName, arguments: { tag: "first" } } },
            { id: "dup", function: { name: toolName, arguments: { tag: "second" } } },
          ],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will throw from session complete on duplicate tool call ids", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const executed = [];
  addDupCompletion("g1-completion", "g1_tool");
  addTool({
    toolName: "g1_tool",
    validate: () => true,
    type: "function",
    function: { name: "g1_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, params, isLast }) => {
      executed.push(params.tag);
      await commitToolOutput(toolId, "out", clientId, agentName);
      if (isLast) await executeForce("finish", clientId);
    },
  });
  const AGENT = addAgent({ agentName: "g1-agent", completion: "g1-completion", prompt: "", tools: ["g1_tool"], maxToolCalls: 5 });
  const SWARM = addSwarm({ swarmName: "g1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  const cs = session(cid, SWARM);
  let thrown = "";
  let result = "";
  try {
    result = await raceHang(cs.complete("start"));
  } catch (error) {
    thrown = error.message;
  }
  const after = await raceHang(cs.complete("hello"));
  await cs.dispose();

  const ok =
    thrown.includes("duplicate tool call id") && executed.length === 0 && after === "echo:hello";

  if (ok) {
    pass();
    return;
  }
  fail(`thrown=${thrown.slice(0, 80)} result=${String(result)} executed=${JSON.stringify(executed)} after=${String(after)}`);
});

test("Will throw from execute on duplicate tool call ids", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addDupCompletion("g2-completion", "g2_tool");
  addTool({
    toolName: "g2_tool",
    validate: () => true,
    type: "function",
    function: { name: "g2_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "out", clientId, agentName);
    },
  });
  const AGENT = addAgent({ agentName: "g2-agent", completion: "g2-completion", prompt: "", tools: ["g2_tool"], maxToolCalls: 5 });
  const SWARM = addSwarm({ swarmName: "g2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  const cs = session(cid, SWARM);
  let thrown = "";
  try {
    await raceHang(execute("start", cid, AGENT));
  } catch (error) {
    thrown = error.message;
  }
  await cs.dispose();

  const ok =
    thrown.includes("duplicate tool call id");

  if (ok) {
    pass();
    return;
  }
  fail(`thrown=${thrown.slice(0, 80)}`);
});

test("Will resolve empty output on configurable operator timeout", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  setConfig({
    CC_ENABLE_OPERATOR_TIMEOUT: true,
    CC_OPERATOR_SIGNAL_TIMEOUT: 300,
  });

  Operator.useOperatorAdapter(
    class extends OperatorInstance {
      async recieveMessage(message) {
        await super.recieveMessage(message);
        // operator never answers
      }
    }
  );

  const AGENT = addAgent({ agentName: "g3-agent", operator: true, prompt: "" });
  const SWARM = addSwarm({ swarmName: "g3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  const cs = session(cid, SWARM);
  const started = Date.now();
  const result = await raceHang(cs.complete("anyone-there"), 5000);
  const elapsed = Date.now() - started;
  await cs.dispose();

  setConfig({ CC_ENABLE_OPERATOR_TIMEOUT: false, CC_OPERATOR_SIGNAL_TIMEOUT: 90_000 });

  const ok =
    result === "" && elapsed >= 280 && elapsed < 4000;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} elapsed=${elapsed}`);
});

test("Will auto-dispose idle chat via configurable inactivity timers", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  setConfig({
    CC_CHAT_INACTIVITY_CHECK: 100,
    CC_CHAT_INACTIVITY_TIMEOUT: 300,
  });

  const events = [];
  Chat.useChatCallbacks({
    onDispose: (clientId) => events.push(`dispose:${clientId}`),
  });

  addCompletion({
    completionName: "g4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "g4-agent", completion: "g4-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "g4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  await Chat.beginChat(cid, SWARM);
  const answer = await Chat.sendMessage(cid, "ping", SWARM);
  const aliveEarly = hasSession(cid);
  await sleep(800);
  const aliveLate = hasSession(cid);

  const ok =
    answer === "echo:ping" && aliveEarly === true && aliveLate === false && events.some((e) => e === `dispose:${cid}`);

  if (ok) {
    pass();
    return;
  }
  fail(`answer=${String(answer)} early=${aliveEarly} late=${aliveLate} events=${JSON.stringify(events)}`);
});

