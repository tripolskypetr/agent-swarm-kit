import { test } from "worker-testbed";

import {
  addAdvisor,
  addCompletion,
  addOutline,
  ask,
  json,
  setConfig,
} from "../../build/index.mjs";

test("Will produce valid outline json with prompt, system and flags in history", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const events = [];
  let seenFormat = null;
  let seenClientId = "";
  let seenOutlineName = "";

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    json: true,
    flags: ["flag-line"],
    getCompletion: async ({ clientId, messages, outlineName, format }) => {
      seenFormat = format;
      seenClientId = clientId;
      seenOutlineName = outlineName;
      const last = messages[messages.length - 1];
      return {
        role: "assistant",
        agentName: "outline",
        content: JSON.stringify({ answer: `A:${last.content}`, score: 5 }),
      };
    },
  });

  const TEST_OUTLINE = addOutline({
    outlineName: "test-outline",
    completion: MOCK_COMPLETION,
    prompt: "outline-prompt",
    system: ["sys-line"],
    format: {
      type: "object",
      required: ["answer", "score"],
      properties: {
        answer: { type: "string" },
        score: { type: "number" },
      },
    },
    getOutlineHistory: async ({ history }, { question }) => {
      await history.push({ role: "user", content: question });
    },
    callbacks: {
      onAttempt: ({ attempt }) => events.push(`attempt:${attempt}`),
      onValidDocument: ({ data }) => events.push(`valid:${data.answer}`),
      onInvalidDocument: () => events.push("invalid"),
    },
  });

  const result = await json(TEST_OUTLINE, { question: "q1" });

  const roles = result.history.map((m) => [m.role, m.content]);
  const ok =
    result.isValid === true &&
    result.data?.answer === "A:q1" &&
    result.data?.score === 5 &&
    result.attempt === 0 &&
    result.params[0]?.question === "q1" &&
    typeof result.resultId === "string" &&
    seenClientId.endsWith("_outline") &&
    seenOutlineName === TEST_OUTLINE &&
    seenFormat?.required?.includes("answer") &&
    roles.some(([r, c]) => r === "system" && c === "outline-prompt") &&
    roles.some(([r, c]) => r === "system" && c === "sys-line") &&
    roles.some(([r, c]) => r === "system" && c === "flag-line") &&
    roles.some(([r, c]) => r === "user" && c === "q1") &&
    events.includes("attempt:0") &&
    events.includes("valid:A:q1") &&
    !events.includes("invalid");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} events=${JSON.stringify(events)} clientId=${seenClientId}`);
});

test("Will retry outline generation after parse and validation errors", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  let calls = 0;
  const attempts = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    json: true,
    getCompletion: async () => {
      calls += 1;
      if (calls === 1) {
        return { role: "assistant", agentName: "outline", content: "not-json" };
      }
      return {
        role: "assistant",
        agentName: "outline",
        content: JSON.stringify({ value: calls }),
      };
    },
  });

  const TEST_OUTLINE = addOutline({
    outlineName: "test-outline",
    completion: MOCK_COMPLETION,
    prompt: "p",
    format: { type: "object", required: ["value"], properties: { value: { type: "number" } } },
    getOutlineHistory: async ({ attempt, history }) => {
      attempts.push(attempt);
      await history.push({ role: "user", content: "give value" });
    },
    validations: [
      ({ data }) => {
        if (data.value < 3) throw new Error("value too small");
      },
    ],
  });

  const result = await json(TEST_OUTLINE);

  const userMessages = result.history.filter((m) => m.role === "user").length;
  const ok =
    result.isValid === true &&
    result.data?.value === 3 &&
    result.attempt === 2 &&
    calls === 3 &&
    attempts.join(",") === "0,1,2" &&
    userMessages === 1;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} calls=${calls} attempts=${attempts}`);
});

test("Will return invalid outline result when attempts are exhausted", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const events = [];
  let calls = 0;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    json: true,
    getCompletion: async () => {
      calls += 1;
      return { role: "assistant", agentName: "outline", content: JSON.stringify({ bad: true }) };
    },
  });

  const TEST_OUTLINE = addOutline({
    outlineName: "test-outline",
    completion: MOCK_COMPLETION,
    maxAttempts: 2,
    format: { type: "object", required: [], properties: {} },
    getOutlineHistory: async ({ history }) => {
      await history.push({ role: "user", content: "x" });
    },
    validations: [
      {
        validate: () => {
          throw new Error("always invalid");
        },
        docDescription: "always fails",
      },
    ],
    callbacks: {
      onValidDocument: () => events.push("valid"),
      onInvalidDocument: ({ error }) => events.push(`invalid:${error}`),
    },
  });

  const result = await json(TEST_OUTLINE);

  const ok =
    result.isValid === false &&
    result.data === null &&
    result.attempt === 2 &&
    calls === 2 &&
    String(result.error).includes("always invalid") &&
    events.some((e) => e.startsWith("invalid:")) &&
    !events.includes("valid");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} calls=${calls} events=${JSON.stringify(events)}`);
});

test("Will guard outline registration and lookup", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let unknownError = "";
  try {
    await json("missing-outline");
  } catch (error) {
    unknownError = error.message;
  }

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    json: true,
    getCompletion: async () => ({ role: "assistant", agentName: "outline", content: "{}" }),
  });
  addOutline({
    outlineName: "test-outline",
    completion: MOCK_COMPLETION,
    format: { type: "object", required: [], properties: {} },
    getOutlineHistory: async () => {},
  });
  let duplicateError = "";
  try {
    addOutline({
      outlineName: "test-outline",
      completion: MOCK_COMPLETION,
      format: { type: "object", required: [], properties: {} },
      getOutlineHistory: async () => {},
    });
  } catch (error) {
    duplicateError = error.message;
  }

  if (unknownError.includes("missing-outline") && duplicateError.includes("already exist")) {
    pass();
    return;
  }
  fail(`unknown=${unknownError} duplicate=${duplicateError}`);
});

test("Will reject outline whose completion is not marked as json", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async () => ({ role: "assistant", agentName: "outline", content: "{}" }),
  });

  const TEST_OUTLINE = addOutline({
    outlineName: "test-outline",
    completion: MOCK_COMPLETION,
    format: { type: "object", required: [], properties: {} },
    getOutlineHistory: async () => {},
  });

  let jsonError = "";
  try {
    await json(TEST_OUTLINE);
  } catch (error) {
    jsonError = error.message;
  }

  if (jsonError.includes("not JSON")) {
    pass();
    return;
  }
  fail(`error=${jsonError}`);
});

test("Will answer through advisor with chat and result callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const events = [];

  const TEST_ADVISOR = addAdvisor({
    advisorName: "test-advisor",
    getChat: async (message) => `advice:${message}`,
    callbacks: {
      onChat: (message) => events.push(`chat:${message}`),
      onResult: (resultId, content) =>
        events.push(`result:${typeof resultId === "string" && resultId.length > 0}:${content}`),
    },
  });

  const answer = await ask("help me", TEST_ADVISOR);

  const ok =
    TEST_ADVISOR === "test-advisor" &&
    answer === "advice:help me" &&
    events.includes("chat:help me") &&
    events.includes("result:true:advice:help me");

  if (ok) {
    pass();
    return;
  }
  fail(`answer=${answer} events=${JSON.stringify(events)}`);
});

test("Will pass structured message object to advisor", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const TEST_ADVISOR = addAdvisor({
    advisorName: "test-advisor",
    getChat: async (message) => `sum:${message.a + message.b}`,
  });

  const answer = await ask({ a: 2, b: 3 }, TEST_ADVISOR);

  if (answer === "sum:5") {
    pass();
    return;
  }
  fail(`answer=${answer}`);
});

test("Will guard advisor registration and lookup", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let unknownError = "";
  try {
    await ask("hi", "missing-advisor");
  } catch (error) {
    unknownError = error.message;
  }

  addAdvisor({ advisorName: "test-advisor", getChat: async () => "x" });
  let duplicateError = "";
  try {
    addAdvisor({ advisorName: "test-advisor", getChat: async () => "y" });
  } catch (error) {
    duplicateError = error.message;
  }

  if (unknownError.includes("missing-advisor") && duplicateError.includes("already exist")) {
    pass();
    return;
  }
  fail(`unknown=${unknownError} duplicate=${duplicateError}`);
});
