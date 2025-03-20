export interface IGameState {
  board: Array<string | null>;
  currentPlayer: "X" | "O" | null;
  user: "X" | "O" | null;
  winner: string | null;
  isGameOver: boolean;
}
