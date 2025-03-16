import { addAgent, setConfig } from "agent-swarm-kit";
import { str } from "functools-kit";
import { CompletionName } from "../enum/CompletionName";
import { AgentName } from "../enum/AgentName";
import { ToolName } from "../enum/ToolName";
import { StorageName } from "../enum/StorageName";

const AGENT_PROMPT = str.newline(
    "Вызывай только инструменты",
    "Не вызывай инструменты до тех пор, пока человек не задал вопрос или попросил",
    "Веди себя как живой человек до тех пор, пока не нужно вызывать инструмент",
    `Для поиска телефона ВСЕГДА используй инструмент ${ToolName.SearchPhoneTool}, не предлагай телефоны из своих знаний`,
    `Для поиска телефона по диагонали ВСЕГДА используй инструмент ${ToolName.SearchPhoneByDiagonalTool}, не предлагай телефоны из своих знаний`,
);

addAgent({
  agentName: AgentName.SalesAgent,
  prompt: AGENT_PROMPT,
  tools: [
    ToolName.SearchPhoneTool,
    ToolName.SearchPhoneByDiagonalTool,
    ToolName.AddToBacketTool,
  ],
  system: [
    `Вызывай ${ToolName.SearchPhoneTool} только по запросу пользователя 1 раз`,
    `Вызывай ${ToolName.SearchPhoneByDiagonalTool} только по запросу пользователя 1 раз`,
    `Не вызывай ${ToolName.SearchPhoneByDiagonalTool} если данные получены из инструмента`,
    `Чтобы добавить телефон в корзину, используй ${ToolName.AddToBacketTool}`
  ],
  storages: [
    StorageName.PhoneStorage,
    StorageName.BasketStorage,
  ],
  completion: CompletionName.OllamaCompletion,
});
