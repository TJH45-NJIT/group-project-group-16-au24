import InvalidParametersError, {
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipBoardPiece,
  BattleShipGameState,
  BattleShipMove,
  GameMove,
} from '../../types/CoveyTownSocket';
import Game from './Game';

export default class BattleShipGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      p1: undefined,
      p2: undefined,
      p1InitialBoard: [],
      p2InitialBoard: [],
      p1Board: [],
      p2Board: [],
      p1MarkerBoard: [[], [], [], [], [], [], [], [], [], []],
      p2MarkerBoard: [[], [], [], [], [], [], [], [], [], []],
      internalState: 'GAME_WAIT',
      status: 'WAITING_TO_START',
    });
  }

  /**
   * Call _setupMove() or _attackMove() based on the kind of move provided. Should parse the relevant information
   * out of the provided argument.
   * @param move The provided move to process.
   */
  public applyMove(move: GameMove<BattleShipMove>): void {
    throw new Error(`${this.id} ${move.playerID} Method not implemented.`);
  }

  /**
   * Handle joining a player to the game. Transition into GAME_START after both players have joined.
   * @param player The player trying to join.
   */
  protected _join(player: Player): void {
    throw new Error(`${this.id} ${player.id} Method not implemented.`);
  }

  /**
   * Handle removing a player from the game. Change game state as appropriate.
   * @param player The player trying to leave.
   */
  protected _leave(player: Player): void {
    if (this.state.p1 !== player.id && this.state.p2 !== player.id)
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    if (['GAME_WAIT', 'GAME_START'].includes(this.state.internalState)) {
      switch (player.id) {
        case this.state.p1:
          // Checking to see if P2 exists is unnecessary.
          this.state.p1 = this.state.p2;
          this.state.p2 = undefined;
          break;
        case this.state.p2:
          this.state.p2 = undefined;
          break;
        default:
          // This should not ever be the case.
          break;
      }
      if (this.state.internalState === 'GAME_START') {
        this.state.p1InitialBoard = [];
        this.state.p2InitialBoard = [];
        this.state.internalState = 'GAME_WAIT';
        this._updateExternalState();
      }
    } else if (this.state.internalState === 'GAME_MAIN') {
      this.state.winner = player.id === this.state.p1 ? this.state.p2 : this.state.p1;
      this.state.internalState = 'GAME_END';
      this._updateExternalState();
    }
  }

  /**
   * Handle player submission of their board setup during GAME_START and validate that the layout is legal.
   * Transition into GAME_MAIN after both players have submitted. Throw error if the board is not legal.
   * @param player The player trying to leave.
   */
  protected _applySetupMove(player: Player, board: BattleShipBoardPiece[][]): void {
    throw new Error(`${this.id} ${player.id} ${board} Method not implemented.`);
  }

  /**
   * Handle an attack that a player makes on their turn during GAME_MAIN, announcing whether it was a hit or
   * miss. The hit/miss should be marked on the marker board for the defending player. If a hit results in
   * completely destroying a ship, this should also be announced. Notify clients to change view to the order
   * board if there is a next turn. Transition into GAME_END if the game ends as a result of a player losing
   * all ships.
   * @param player The player making the move.
   * @param posX The index of the "row" that corresponds to the attacked position.
   * @param posY The index of the "column" that corresponds to the attacked position.
   */
  protected _applyAttackMove(player: Player, posX: number, posY: number): void {
    throw new Error(`${this.id} ${player.id} ${posX} ${posY} Method not implemented.`);
  }

  /**
   * Update state.status based on the current value of status.internalState. This allows the more complicated
   * state transitions to exist within the implementation but still conform to the primary game interface in
   * Covey.Town.
   */
  protected _updateExternalState(): void {
    throw new Error(`${this.id} Method not implemented.`);
  }

  /**
   * Stores relevant game conclusion information to a GameHistory database.
   */
  protected _appendGameHistory(winner: Player, loser: Player, remainingShips: number): void {
    throw new Error(
      `${this.id} ${winner.id} ${loser.id} ${remainingShips} Method not implemented.`,
    );
  }

  /**
   * Retrieves the most recent game entries in the GameHistory database for display.
   */
  public retrieveGameHistory(): string {
    throw new Error(`${this.id} Method not implemented.`);
  }

  /**
   * Retrieves the best performed game entries in the GameHistory database for display.
   */
  public retrieveLeaderboard(): string {
    throw new Error(`${this.id} Method not implemented.`);
  }
}
