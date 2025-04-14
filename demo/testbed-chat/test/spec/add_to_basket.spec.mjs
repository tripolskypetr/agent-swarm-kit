import {
  Chat,
  commitToolOutput,
  emit,
  getLastAssistantMessage,
  overrideTool,
} from "agent-swarm-kit";
import { randomString } from "functools-kit";
import { test } from "worker-testbed";
import { SwarmName, ToolName } from "testbed-chat";
import fs from "fs/promises";

const CLIENT_ID = `test-client-id-${randomString()}`;

test(`${ToolName.AddToBacketTool} will be called after direct ask`, async (t) => {
  let isCalled = false;

  overrideTool({
    toolName: ToolName.AddToBacketTool,
    call: async ({ toolId, clientId, agentName, params }) => {
      fs.appendFile(
        "test.log",
        `${ToolName.AddToBacketTool} called with params: ${JSON.stringify(
          params
        )}\n`
      );

      isCalled = true;
      await commitToolOutput(toolId, "Ok", clientId, agentName);
      await emit("Ok", clientId, agentName);
    },
  });

  await Chat.sendMessage(
    CLIENT_ID,
    "Add iPhone X to the cart",
    SwarmName.RootSwarm
  );

  if (isCalled) {
    t.pass(`${ToolName.AddToBacketTool} tool was called successfully`);
  } else {
    await fs.appendFile(
      "logs/test.log",
      `The agent commit an answer instead of tool call: ${JSON.stringify(
        await getLastAssistantMessage(CLIENT_ID)
      )}\n`
    );
    t.fail(`${ToolName.AddToBacketTool} payment tool was not called`);
  }
});
