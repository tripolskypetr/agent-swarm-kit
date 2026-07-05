import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitAssistantMessage,
  commitDeveloperMessage,
  commitFlush,
  commitSystemMessage,
  commitToolOutput,
  executeForce,
  getRawHistory,
  runStateless,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

test("Will run a nested runStateless call inside a running tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let statelessResult = null;
  addCompletion({
    completionName: "t1-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "t1_tool", arguments: {} } }],
        };
      }
      if (last.content === "sub-query") {
        return { agentName, content: "sub-answer", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "t1_tool",
    validate: () => true,
    type: "function",
    function: { name: "t1_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      // nested stateless call from within the running tool
      statelessResult = await runStateless("sub-query", clientId, agentName);
      await commitToolOutput(toolId, `used:${statelessResult}`, clientId, agentName);
      await executeForce("finish", clientId);
    },
  });
  const A = addAgent({ agentName: "t1-agent", completion: "t1-completion", prompt: "", tools: ["t1_tool"] });
  const S = addSwarm({ swarmName: "t1-swarm", agentList: [A], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const result = await raceHang(cs.complete("start"));
  await cs.dispose();
  const ok =
    statelessResult === "sub-answer" && result === "echo:finish";

  if (ok) {
    pass();
    return;
  }
  fail(`stateless=${statelessResult} result=${String(result)}`);
});

test("Will surface commitSystemMessage from a tool to the next completion", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let sawSystem = false;
  addCompletion({
    completionName: "t2-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "t2_tool", arguments: {} } }],
        };
      }
      // after tool: check whether the injected system fact is in context
      sawSystem = messages.some((m) => m.role === "system" && m.content === "injected-fact");
      return { agentName, content: "final", role: "assistant" };
    },
  });
  addTool({
    toolName: "t2_tool",
    validate: () => true,
    type: "function",
    function: { name: "t2_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitSystemMessage("injected-fact", clientId, agentName);
      await commitToolOutput(toolId, "done", clientId, agentName);
      await executeForce("continue", clientId);
    },
  });
  const A = addAgent({ agentName: "t2-agent", completion: "t2-completion", prompt: "", tools: ["t2_tool"] });
  const S = addSwarm({ swarmName: "t2-swarm", agentList: [A], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const result = await raceHang(cs.complete("start"));
  await cs.dispose();
  const ok =
    result === "final" && sawSystem === true;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} sawSystem=${sawSystem}`);
});

test("Will land assistant and developer commits from a tool into history", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let sawAssistant = false;
  let sawDeveloper = false;
  addCompletion({
    completionName: "t3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "t3_tool", arguments: {} } }],
        };
      }
      sawAssistant = messages.some((m) => m.role === "assistant" && m.content === "assistant-note");
      sawDeveloper = messages.some((m) => m.content === "developer-note");
      return { agentName, content: "final", role: "assistant" };
    },
  });
  addTool({
    toolName: "t3_tool",
    validate: () => true,
    type: "function",
    function: { name: "t3_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitAssistantMessage("assistant-note", clientId, agentName);
      await commitDeveloperMessage("developer-note", clientId, agentName);
      await commitToolOutput(toolId, "done", clientId, agentName);
      await executeForce("continue", clientId);
    },
  });
  const A = addAgent({ agentName: "t3-agent", completion: "t3-completion", prompt: "", tools: ["t3_tool"] });
  const S = addSwarm({ swarmName: "t3-swarm", agentList: [A], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const result = await raceHang(cs.complete("start"));
  await cs.dispose();
  const ok =
    result === "final" && sawAssistant === true && sawDeveloper === true;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} sawAssistant=${sawAssistant} sawDeveloper=${sawDeveloper}`);
});

test("Will clear history via commitFlush inside a tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let sawStart = null;
  addCompletion({
    completionName: "t4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "t4_tool", arguments: {} } }],
        };
      }
      if (last.content === "after-flush") {
        sawStart = messages.some((m) => m.content === "start");
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "t4_tool",
    validate: () => true,
    type: "function",
    function: { name: "t4_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitFlush(clientId, agentName);
      await executeForce("after-flush", clientId);
    },
  });
  const A = addAgent({ agentName: "t4-agent", completion: "t4-completion", prompt: "", tools: ["t4_tool"] });
  const S = addSwarm({ swarmName: "t4-swarm", agentList: [A], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const result = await raceHang(cs.complete("start"));
  await cs.dispose();
  const ok =
    result === "echo:after-flush" && sawStart === false;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} sawStart=${sawStart}`);
});

test("Will leave session history untouched after runStateless", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "t5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const A = addAgent({ agentName: "t5-agent", completion: "t5-completion", prompt: "" });
  const S = addSwarm({ swarmName: "t5-swarm", agentList: [A], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  await cs.complete("real-message");
  const before = (await getRawHistory(cid)).length;
  const stateless = await runStateless("ghost-message", cid, A);
  const after = (await getRawHistory(cid)).length;
  await cs.dispose();
  const ok =
    stateless === "echo:ghost-message" && before === after;

  if (ok) {
    pass();
    return;
  }
  fail(`stateless=${stateless} before=${before} after=${after}`);
});

