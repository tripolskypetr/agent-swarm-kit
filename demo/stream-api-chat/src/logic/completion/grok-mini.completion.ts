import { addCompletion, type ICompletionArgs, type IModelMessage } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { getGrok } from "../../config/grok";
import { retry, CANCELED_PROMISE_SYMBOL } from "functools-kit";

const completion = retry(async ({
  agentName,
  messages: rawMessages,
  mode,
  tools,
}: ICompletionArgs): Promise<IModelMessage> => {
  const grok = getGrok();

  const messages = rawMessages.map(
    ({ role, tool_call_id, tool_calls, content }) => ({
      role,
      tool_call_id,
      content,
      tool_calls: tool_calls?.map(({ function: f, ...rest }) => ({
        ...rest,
        function: {
          name: f.name,
          arguments: JSON.stringify(f.arguments),
        },
      })),
    })
  );

  const completion: any = await grok.chat.completions.create({
    model: "grok-3-mini",
    messages: messages as any,
    tools: tools as any,
    response_format: {
      type: "text",
    }
  });

  const {
    choices: [
      {
        message: { content, role, tool_calls },
      },
    ],
  } = completion;

  return {
    content: content!,
    mode,
    agentName,
    role,
    tool_calls: tool_calls?.map(({ function: f, ...rest }: any) => ({
      ...rest,
      function: {
        name: f.name,
        arguments: JSON.parse(f.arguments),
      },
    })),
  };
}, 5, 30_000);

addCompletion({
  completionName: CompletionName.GrokMiniCompletion,
  getCompletion: async (params) => {
    const answer = await completion(params);
    if (answer === CANCELED_PROMISE_SYMBOL) {
      throw new Error("grok-mini-completion recieved canceled status");
    }
    return answer;
  },
  flags: [
    "Всегда пиши ответ на русском языке"
  ]
});
