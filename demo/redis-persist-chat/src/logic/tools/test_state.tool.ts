import { addTool, commitToolOutput, execute, State } from "agent-swarm-kit";
import { z } from "zod";
import { ToolName } from "../../enum/ToolName";
import type { IGameState } from "../../model/GameState.model";
import { StateName } from "../../enum/StateName";

const PARAMETER_SCHEMA = z.object({}).strict();

addTool({
  toolName: ToolName.TestStateTool,
  type: "function",
  validate: async ({ clientId, agentName, params }) => {
    const validationResult = PARAMETER_SCHEMA.safeParse(params);
    return validationResult.success;
  },
  call: async ({ toolId, clientId, agentName, params }) => {
    await State.setState<IGameState>(
      {
        board: Array(9).fill(null),
        currentPlayer: null,
        user: null,
        winner: null,
        isGameOver: false,
      },
      {
        clientId,
        agentName,
        stateName: StateName.TicTacToeState,
      }
    );
    await commitToolOutput(
      toolId,
      "State tested successfully.",
      clientId,
      agentName
    );
    await execute(
      "Tell me the state has been tested successfully.",
      clientId,
      agentName
    );
  },
  function: {
    name: ToolName.TestStateTool,
    description: "Test the state.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
});
