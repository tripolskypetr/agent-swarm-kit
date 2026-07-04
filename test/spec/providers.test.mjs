import { test } from "worker-testbed";
import http from "node:http";

import {
  Adapter,
  TOOL_PROTOCOL_PROMPT,
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitToolOutput,
  executeForce,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

const makeToolAgent = (suffix, completionName, toolFnName, onParams) => {
  const TOOL = addTool({
    toolName: toolFnName,
    validate: () => true,
    type: "function",
    function: {
      name: toolFnName,
      description: "test tool",
      parameters: { type: "object", properties: {}, required: [] },
    },
    call: async ({ toolId, clientId, agentName, params, isLast }) => {
      onParams(params, toolId);
      await commitToolOutput(toolId, "tool-done", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });
  const AGENT = addAgent({
    agentName: `${suffix}-agent`,
    completion: completionName,
    prompt: "sys-prompt",
    tools: [TOOL],
  });
  return addSwarm({
    swarmName: `${suffix}-swarm`,
    agentList: [AGENT],
    defaultAgent: AGENT,
  });
};

test("Will map fromOpenAI tool calls in both directions", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const bodies = [];
  let toolParams = null;

  const openaiMock = {
    chat: {
      completions: {
        create: async (body) => {
          bodies.push(body);
          const last = body.messages[body.messages.length - 1];
          if (last.content === "start") {
            return {
              choices: [{
                message: {
                  role: "assistant",
                  content: "",
                  tool_calls: [{
                    id: "call_1",
                    type: "function",
                    function: { name: "a1_tool", arguments: '{"x":2}' },
                  }],
                },
              }],
            };
          }
          return { choices: [{ message: { role: "assistant", content: "openai-done" } }] };
        },
      },
    },
  };

  addCompletion({
    completionName: "a1-completion",
    getCompletion: Adapter.fromOpenAI(openaiMock, "test-model"),
  });
  const SWARM = makeToolAgent("a1", "a1-completion", "a1_tool", (params) => {
    toolParams = params;
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const second = bodies[1];
  const assistantMsg = second?.messages.find((m) => m.tool_calls?.length);
  const toolMsg = second?.messages.find((m) => m.role === "tool");
  const ok =
    result === "openai-done" &&
      toolParams?.x === 2 &&
      bodies[0]?.model === "test-model" &&
      bodies[0]?.temperature === 0 &&
      typeof assistantMsg?.tool_calls[0].function.arguments === "string" &&
      toolMsg?.tool_call_id === "call_1" &&
      toolMsg?.content === "tool-done";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} params=${JSON.stringify(toolParams)} second=${JSON.stringify(second?.messages)}`);
});

test("Will complete happy path through fromLMStudio", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const bodies = [];

  const lmMock = {
    chat: {
      completions: {
        create: async (body) => {
          bodies.push(body);
          const last = body.messages[body.messages.length - 1];
          return { choices: [{ message: { role: "assistant", content: `lm:${last.content}` } }] };
        },
      },
    },
  };

  addCompletion({
    completionName: "a2-completion",
    getCompletion: Adapter.fromLMStudio(lmMock, "lm-model"),
  });
  const AGENT = addAgent({ agentName: "a2-agent", completion: "a2-completion", prompt: "sys" });
  const SWARM = addSwarm({ swarmName: "a2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("hello");
  await chatSession.dispose();

  const ok =
    result === "lm:hello" && bodies[0]?.model === "lm-model" && bodies[0]?.seed === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} body=${JSON.stringify(bodies[0])}`);
});

test("Will map fromGrok tool calls in both directions", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let toolParams = null;

  const grokMock = {
    chat: {
      completions: {
        create: async (body) => {
          const last = body.messages[body.messages.length - 1];
          if (last.content === "start") {
            return {
              choices: [{
                message: {
                  role: "assistant",
                  content: "",
                  tool_calls: [{
                    id: "grok_1",
                    type: "function",
                    function: { name: "a3_tool", arguments: '{"g":3}' },
                  }],
                },
              }],
            };
          }
          return { choices: [{ message: { role: "assistant", content: "grok-done" } }] };
        },
      },
    },
  };

  addCompletion({
    completionName: "a3-completion",
    getCompletion: Adapter.fromGrok(grokMock),
  });
  const SWARM = makeToolAgent("a3", "a3-completion", "a3_tool", (params) => {
    toolParams = params;
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const ok =
    result === "grok-done" && toolParams?.g === 3;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} params=${JSON.stringify(toolParams)}`);
});

test("Will prepend protocol prompt and generate ids in fromOllama", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const bodies = [];
  let toolParams = null;
  let toolIdSeen = null;

  const ollamaMock = {
    chat: async (body) => {
      bodies.push(body);
      const last = body.messages[body.messages.length - 1];
      if (last.content === "start") {
        return {
          message: {
            role: "assistant",
            content: "",
            tool_calls: [{ function: { name: "a4_tool", arguments: { z: 5 } } }],
          },
        };
      }
      return { message: { role: "assistant", content: "ollama-done" } };
    },
  };

  addCompletion({
    completionName: "a4-completion",
    getCompletion: Adapter.fromOllama(ollamaMock, "test-ollama"),
  });
  const SWARM = makeToolAgent("a4", "a4-completion", "a4_tool", (params, toolId) => {
    toolParams = params;
    toolIdSeen = toolId;
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const ok =
    result === "ollama-done" &&
      toolParams?.z === 5 &&
      typeof toolIdSeen === "string" &&
      toolIdSeen.length > 0 &&
      bodies[0]?.messages[0]?.content === TOOL_PROTOCOL_PROMPT &&
      bodies[0]?.model === "test-ollama";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} params=${JSON.stringify(toolParams)} first=${JSON.stringify(bodies[0]?.messages[0])}`);
});

test("Will map fromCohereClientV2 camelCase tool calls", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const bodies = [];
  let toolParams = null;

  const cohereMock = {
    chat: async (body) => {
      bodies.push(body);
      const last = body.messages[body.messages.length - 1];
      if (last.content === "start") {
        return {
          message: {
            role: "assistant",
            content: null,
            toolCalls: [{
              id: "coh_1",
              type: "function",
              function: { name: "a5_tool", arguments: '{"c":7}' },
            }],
          },
        };
      }
      return { message: { role: "assistant", content: [{ text: "cohere-done" }] } };
    },
  };

  addCompletion({
    completionName: "a5-completion",
    getCompletion: Adapter.fromCohereClientV2(cohereMock),
  });
  const SWARM = makeToolAgent("a5", "a5-completion", "a5_tool", (params) => {
    toolParams = params;
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const second = bodies[1];
  const toolMsg = second?.messages.find((m) => m.role === "tool");
  const ok =
    result === "cohere-done" && toolParams?.c === 7 && toolMsg?.toolCallId === "coh_1";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} params=${JSON.stringify(toolParams)} toolMsg=${JSON.stringify(toolMsg)}`);
});

test("Will map fromHf chatCompletion tool roundtrip", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const bodies = [];
  let toolParams = null;

  const hfMock = {
    chatCompletion: async (body) => {
      bodies.push(body);
      const last = body.messages[body.messages.length - 1];
      if (last.content === "start") {
        return {
          choices: [{
            message: {
              content: "",
              tool_calls: [{
                id: "hf_1",
                type: "function",
                function: { name: "a6_tool", arguments: '{"h":9}' },
              }],
            },
          }],
        };
      }
      return { choices: [{ message: { content: "hf-done", tool_calls: undefined } }] };
    },
  };

  addCompletion({
    completionName: "a6-completion",
    getCompletion: Adapter.fromHf(hfMock, "hf-model"),
  });
  const SWARM = makeToolAgent("a6", "a6-completion", "a6_tool", (params) => {
    toolParams = params;
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const second = bodies[1];
  const toolMsg = second?.messages.find((m) => m.role === "tool");
  const ok =
    result === "hf-done" && toolParams?.h === 9 && toolMsg?.tool_call_id === "hf_1" && bodies[0]?.model === "hf-model";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} params=${JSON.stringify(toolParams)} toolMsg=${JSON.stringify(toolMsg)}`);
});

test("Will merge system prompts for fromCortex http roundtrip", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const bodies = [];

  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const body = JSON.parse(raw);
      bodies.push(body);
      const last = body.messages[body.messages.length - 1];
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          choices: [{ message: { role: "assistant", content: `cortex:${last.content}` } }],
        })
      );
    });
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  addCompletion({
    completionName: "a7-completion",
    getCompletion: Adapter.fromCortex("test-cortex", `http://127.0.0.1:${port}/`),
  });
  const AGENT = addAgent({ agentName: "a7-agent", completion: "a7-completion", prompt: "sys-one" });
  const SWARM = addSwarm({ swarmName: "a7-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("ping");
  await chatSession.dispose();
  server.close();

  const first = bodies[0];
  const ok =
    result === "cortex:ping" &&
      first?.model === "test-cortex" &&
      first?.messages[0]?.role === "system" &&
      first?.messages[0]?.content.includes("sys-one");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} body=${JSON.stringify(first)}`);
});

test("Will retry transient adapter failure", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let calls = 0;

  const flakyMock = {
    chat: {
      completions: {
        create: async (body) => {
          calls += 1;
          if (calls === 1) {
            throw new Error("transient failure");
          }
          const last = body.messages[body.messages.length - 1];
          return { choices: [{ message: { role: "assistant", content: `ok:${last.content}` } }] };
        },
      },
    },
  };

  addCompletion({
    completionName: "a8-completion",
    getCompletion: Adapter.fromOpenAI(flakyMock),
  });
  const AGENT = addAgent({ agentName: "a8-agent", completion: "a8-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "a8-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const started = Date.now();
  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("retry");
  await chatSession.dispose();
  const elapsed = Date.now() - started;

  const ok =
    result === "ok:retry" && calls === 2 && elapsed >= 4_000;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} calls=${calls} elapsed=${elapsed}`);
});

test("Will recover empty output via recomplete resque strategy", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  setConfig({ CC_RESQUE_STRATEGY: "recomplete" });
  let recompleted = false;

  addCompletion({
    completionName: "r1-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content.includes("Please analyze the last tool call")) {
        recompleted = true;
        return { agentName, content: "recovered", role: "assistant" };
      }
      if (last.content === "bad") {
        return { agentName, content: "", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "r1-agent", completion: "r1-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "r1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("bad");
  await chatSession.dispose();
  setConfig({ CC_RESQUE_STRATEGY: "flush" });

  const ok =
    result === "recovered" && recompleted === true;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} recompleted=${recompleted}`);
});

test("Will replace empty output via custom resque strategy", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  setConfig({
    CC_RESQUE_STRATEGY: "custom",
    CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: async (clientId, agentName) => ({
      agentName,
      role: "assistant",
      mode: "tool",
      content: "custom-fix",
    }),
  });

  addCompletion({
    completionName: "r2-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "bad") {
        return { agentName, content: "", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "r2-agent", completion: "r2-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "r2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("bad");
  await chatSession.dispose();
  setConfig({ CC_RESQUE_STRATEGY: "flush" });

  const ok =
    result === "custom-fix";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result}`);
});

