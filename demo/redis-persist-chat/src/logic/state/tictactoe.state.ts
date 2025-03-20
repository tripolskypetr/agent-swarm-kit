import { addState } from 'agent-swarm-kit';
import { StateName } from '../../enum/StateName';
import type { IGameState } from '../../model/GameState.model';

addState({
  stateName: StateName.TicTacToeState,
  getDefaultState: (): IGameState => ({
    board: Array(9).fill(null),
    currentPlayer: null,
    user: null,
    winner: null,
    isGameOver: false
  }),
  getState: (): IGameState => ({
    board: Array(9).fill(null),
    currentPlayer: null,
    user: null,
    winner: null,
    isGameOver: false
  }),
  middlewares: [
    async (state: IGameState) => {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
      ];

      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
          state.board[a] &&
          state.board[a] === state.board[b] &&
          state.board[a] === state.board[c]
        ) {
          state.winner = state.board[a];
          state.isGameOver = true;
          break;
        }
      }

      if (!state.winner && !state.board.includes(null)) {
        state.isGameOver = true;
      }

      return state;
    }
  ]
});
