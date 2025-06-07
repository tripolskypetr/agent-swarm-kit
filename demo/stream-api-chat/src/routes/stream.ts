import { app } from "../config/app";
import { streamText } from "hono/streaming";
import { Chat, listenEvent } from "agent-swarm-kit";
import { SwarmName } from "../logic/enum/SwarmName";
import { randomString } from "functools-kit";
import { log } from "pinolog";

const getCreatedAt = () => Math.floor(Date.now() / 1000);

const CLIENT_ID = `one_cli_${randomString()}`;

app.post("/v1/chat/completions", async (c) => {
  const { model = "llama3.1", messages, stream = false, ...other } = await c.req.json();

  const [{ content: input }] = messages.slice(-1);

  if (typeof input !== "string") {
    throw new Error("Only text chats are supported");
  }

  log("/v1/chat/completions", {
    clientId: CLIENT_ID,
    input,
  });

  await Chat.beginChat(CLIENT_ID, SwarmName.RootSwarm);

  const responseBase = {
    id: `chatcmpl-${Math.random().toString(36).substring(2)}`,
    object: stream ? "chat.completion.chunk" : "chat.completion",
    created: getCreatedAt(),
    model,
  };

  if (stream) {
    return streamText(c, async (stream) => {
      // Send initial response with role
      await stream.write(
        `data: ${JSON.stringify({
          ...responseBase,
          choices: [
            {
              index: 0,
              delta: {
                role: "assistant",
                content: "",
              },
              finish_reason: null,
            },
          ],
        })}\n\n`
      );

      let fullContent = "";
      const unToken = listenEvent(CLIENT_ID, "llm-new-token", async (token: string) => {
        fullContent += token;
        // Stream each token as a delta update
        await stream.write(
          `data: ${JSON.stringify({
            ...responseBase,
            choices: [
              {
                index: 0,
                delta: {
                  content: token,
                },
                finish_reason: null,
              },
            ],
          })}\n\n`
        );
      });

      // Send the message and wait for completion
      await Chat.sendMessage(CLIENT_ID, input, SwarmName.RootSwarm)

      // Send final chunk with finish_reason
      await stream.write(
        `data: ${JSON.stringify({
          ...responseBase,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: "stop",
            },
          ],
        })}\n\n`
      );

      await stream.write("data: [DONE]\n\n");
      unToken();
    });
  }

  // Non-streaming response
  const content = await Chat.sendMessage(CLIENT_ID, input, SwarmName.RootSwarm)

  return c.json({
    ...responseBase,
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
  });
});
