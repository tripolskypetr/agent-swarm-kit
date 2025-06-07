import { app } from "../config/app";
import { streamText } from "hono/streaming";
import { Chat } from "agent-swarm-kit";
import { SwarmName } from "../logic/enum/SwarmName";
import { randomString } from "functools-kit";
import { log } from "pinolog";

const getCreatedAt = () => Math.floor(Date.now() / 1000);

const CLIENT_ID = `one_cli_${randomString()}`;

app.post("/v1/chat/completions", async (c) => {

  const { model = "llama3.1", messages, stream = false } = await c.req.json();

  const [{ content: input }] = messages.slice(-1);

  if (typeof input !== "string") {
    throw new Error("Only text chats are supported");
  }

  log("/v1/chat/completions", {
    clientId: CLIENT_ID,
    input,
  });

  const content = await Chat.sendMessage(CLIENT_ID, input, SwarmName.RootSwarm);

  const responseBase = {
    id: `chatcmpl-${Math.random().toString(36).substring(2)}`,
    object: "chat.completion",
    created: getCreatedAt(),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: input.length,
      completion_tokens: content.length,
      total_tokens: input.length + content.length,
    },
  };

  if (stream) {
    return streamText(c, async (stream) => {
      await stream.write(
        `data: ${JSON.stringify({
          ...responseBase,
          choices: [
            {
              index: 0,
              delta: {
                role: "assistant",
                content,
              },
              finish_reason: "stop",
            },
          ],
        })}\n\n`
      );
      await stream.write("data: [DONE]\n\n");
    });
  }

  return c.json(responseBase);
});
