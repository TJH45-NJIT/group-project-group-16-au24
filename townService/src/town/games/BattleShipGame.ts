import util from 'node:util';
import InvalidParametersError, {
  BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE,
  BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE,
  BATTLESHIP_SETUP_SHIP_MISSING_MESSAGE,
  BATTLESHIP_SETUP_SHIP_MISSING_SEPARATOR,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipBoardMarker,
  BattleShipBoardPiece,
  BattleShipGameState,
  BattleShipGridPosition,
  BattleShipMove,
  GameMove,
  PlayerID,
} from '../../types/CoveyTownSocket';
import Game from './Game';

export default class BattleShipGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      p1: undefined,
      p2: undefined,
      p1Username: 'Player 1',
      p2Username: 'Player 2',
      p1InitialBoard: [],
      p2InitialBoard: [],
      p1Board: [[], [], [], [], [], [], [], [], [], []],
      p2Board: [[], [], [], [], [], [], [], [], [], []],
      p1MarkerBoard: [[], [], [], [], [], [], [], [], [], []],
      p2MarkerBoard: [[], [], [], [], [], [], [], [], [], []],
      p1SunkenShips: [],
      p2SunkenShips: [],
      lastMoveHit: false,
      lastShipHit: undefined,
      turnPlayer: undefined,
      internalState: 'GAME_WAIT',
      status: 'WAITING_TO_START',
      moves: [],
    });
  }

  /**
   * Call _applySetupMove() or _applyAttackMove() based on the kind of move provided. Should parse the relevant information
   * out of the provided argument.
   * @param move The provided move to process.
   */
  public applyMove(move: GameMove<BattleShipMove>): void {
    if (this.state.status !== 'IN_PROGRESS')
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (Array.isArray(move.move)) {
      this._applySetupMove(move.playerID, move.move);
    } else if (typeof move.move === 'object' && 'posX' in move.move && 'posY' in move.move) {
      this._applyAttackMove(
        move.playerID,
        move.move.posX as BattleShipGridPosition,
        move.move.posY as BattleShipGridPosition,
      );
      this.state.moves.push(move.move);
    }
  }

  /**
   * Handle joining a player to the game. Transition into GAME_START after both players have joined.
   * @param player The player trying to join.
   */
  protected _join(player: Player): void {
    if (this._playerInGame(player)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (this._players.length === 2) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this._players.length === 0) {
      this.state.p1 = player.id;
      this.state.internalState = 'GAME_WAIT';
      this._updateExternalState();
    } else {
      this.state.p2 = player.id;
      this.state.internalState = 'GAME_START';
      this._updateExternalState();
    }
  }

  /**
   * Checks if Player is in game list.
   * @param player The player to join the game
   * @returns boolean if player is in game
   */
  private _playerInGame(player: Player): boolean {
    for (let i = 0; i < this._players.length; i += 1) {
      if (this._players[i] === player) {
        return true;
      }
    }
    return false;
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
   * Throw an exception if the given ship is not placed correctly on the given initial board.
   * Update the array of checked spots as they are scanned.
   * Precondition: The first two spots for the ship have already been verified as correct,
   * but those spots have not yet been updated in the array of checked spots.
   * @param board The proposed initial board
   * @param checkedSpots The array indicating which spots have already been verfied as correct
   * @param piece The ship whose validity is to be verified
   * @param x The x-coordinate of the top-left corner of the ship
   * @param y The y-coordinate of the top-left corner of the ship
   * @param isXAxis The axis being scanned along: true for x-axis, false for y-axis
   */
  private static _verifyShipValidity(
    board: BattleShipBoardPiece[][],
    checkedSpots: boolean[][],
    piece: BattleShipBoardPiece,
    x: number,
    y: number,
    isXAxis: boolean,
  ): void {
    const shipSizes = new Map<BattleShipBoardPiece, number>([
      ['Destroyer', 2],
      ['Submarine', 3],
      ['Cruiser', 3],
      ['Battleship', 4],
      ['Carrier', 5],
    ]);
    checkedSpots[x][y] = true;
    if (isXAxis) checkedSpots[x + 1][y] = true;
    else checkedSpots[x][y + 1] = true;
    const finalSpot = (isXAxis ? x : y) + (shipSizes.get(piece) ?? 0) - 1;
    if (finalSpot >= 10)
      throw new InvalidParametersError(
        util.format(BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE, piece),
      );
    if (isXAxis)
      for (let nextSpot = x + 2; nextSpot <= finalSpot; nextSpot++)
        if (board[nextSpot][y] === piece) checkedSpots[nextSpot][y] = true;
        else
          throw new InvalidParametersError(
            util.format(BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE, piece),
          );
    else
      for (let nextSpot = y + 2; nextSpot <= finalSpot; nextSpot++)
        if (board[x][nextSpot] === piece) checkedSpots[x][nextSpot] = true;
        else
          throw new InvalidParametersError(
            util.format(BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE, piece),
          );
  }

  /**
   * Handle player submission of their board setup during GAME_START and validate that the layout is legal.
   * Transition into GAME_MAIN after both players have submitted. Throw error if the board is not legal.
   * @param playerID The ID of the player submitting their initial board.
   * @param board The initial board to be checked and, if legal, recorded.
   */
  protected _applySetupMove(playerID: PlayerID, board: BattleShipBoardPiece[][]): void {
    if (playerID !== this.state.p1 && playerID !== this.state.p2)
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    if (playerID === this.state.p1 && this.state.p1InitialBoard.length === 10)
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    if (playerID === this.state.p2 && this.state.p2InitialBoard.length === 10)
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    const checkedSpots: boolean[][] = [[], [], [], [], [], [], [], [], [], []];
    const missingShips: BattleShipBoardPiece[] = [
      'Destroyer',
      'Submarine',
      'Cruiser',
      'Battleship',
      'Carrier',
    ];
    // Scanning each spot to find the top-left corner of all placed ships
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) {
        const piece = board[x][y];
        if (checkedSpots[x][y] !== true && piece !== undefined && piece !== null) {
          if (!missingShips.includes(piece))
            throw new InvalidParametersError(
              util.format(BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE, piece),
            );
          // Verifying ship correctness upon finding a new ship
          if (x + 1 < 10 && board[x + 1][y] === piece)
            BattleShipGame._verifyShipValidity(board, checkedSpots, piece, x, y, true);
          else if (y + 1 < 10 && board[x][y + 1] === piece)
            BattleShipGame._verifyShipValidity(board, checkedSpots, piece, x, y, false);
          else
            throw new InvalidParametersError(
              util.format(BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE, piece),
            );
          missingShips.splice(
            missingShips.findIndex(value => value === piece),
            1,
          );
        }
      }
    if (missingShips.length !== 0)
      throw new InvalidParametersError(
        util.format(
          BATTLESHIP_SETUP_SHIP_MISSING_MESSAGE,
          missingShips.join(BATTLESHIP_SETUP_SHIP_MISSING_SEPARATOR),
        ),
      );
    if (playerID === this.state.p1) this.state.p1InitialBoard = board;
    else this.state.p2InitialBoard = board;
    if (this.state.p1InitialBoard.length === 10 && this.state.p2InitialBoard.length === 10) {
      for (let x = 0; x < 10; x++)
        for (let y = 0; y < 10; y++) {
          this.state.p1Board[x][y] = this.state.p1InitialBoard[x][y];
          this.state.p2Board[x][y] = this.state.p2InitialBoard[x][y];
        }
      this.state.p1Username =
        this._players.find(value => value.id === this.state.p1)?.userName ?? 'Player 1';
      this.state.p2Username =
        this._players.find(value => value.id === this.state.p2)?.userName ?? 'Player 2';
      this.state.turnPlayer = this.state.p1;
      this.state.internalState = 'GAME_MAIN';
      this._updateExternalState();
    }
  }

  /**
   * Detect if a given ship has sunk on a given board, and add that ship to the given
   * sunken ships array if it did.
   * @param shipBoard The board to scan for the given ship
   * @param hitShip The ship for which to scan
   * @param sunkenShips The array to update if the given ship has sunk
   */
  private static _detectSunkenShip(
    shipBoard: BattleShipBoardPiece[][],
    hitShip: BattleShipBoardPiece,
    sunkenShips: BattleShipBoardPiece[],
  ): void {
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) if (shipBoard[x][y] === hitShip) return;
    sunkenShips.push(hitShip);
  }

  /**
   * Handle an attack that a player makes on their turn during GAME_MAIN, announcing whether it was a hit or
   * miss. The hit/miss should be marked on the marker board for the defending player. If a hit results in
   * completely destroying a ship, this should also be announced. The turn player should change if the move
   * doesn't cause the game to end. Transition into GAME_END if the game ends as a result of a player losing
   * all ships.
   * @param playerID The ID of the player making the move.
   * @param posX The index of the "row" that corresponds to the attacked position.
   * @param posY The index of the "column" that corresponds to the attacked position.
   */
  protected _applyAttackMove(
    playerID: PlayerID,
    posX: BattleShipGridPosition,
    posY: BattleShipGridPosition,
  ): void {
    if (playerID !== this.state.p1 && playerID !== this.state.p2)
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    if (this.state.internalState !== 'GAME_MAIN')
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (playerID !== this.state.turnPlayer)
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    let shipBoard: BattleShipBoardPiece[][];
    let markerBoard: BattleShipBoardMarker[][];
    let opponentID: PlayerID | undefined;
    let sunkenShips: BattleShipBoardPiece[];
    if (playerID === this.state.p1) {
      shipBoard = this.state.p2Board;
      markerBoard = this.state.p2MarkerBoard;
      opponentID = this.state.p2;
      sunkenShips = this.state.p2SunkenShips;
    } else {
      shipBoard = this.state.p1Board;
      opponentID = this.state.p1;
      markerBoard = this.state.p1MarkerBoard;
      sunkenShips = this.state.p1SunkenShips;
    }
    if (markerBoard[posX][posY] !== undefined)
      throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
    const hitShip = shipBoard[posX][posY];
    if (hitShip === undefined || hitShip === null) {
      // When the shot misses
      markerBoard[posX][posY] = 'M';
      this.state.lastMoveHit = false;
      this.state.turnPlayer = opponentID;
    } else {
      // When the shot hits
      markerBoard[posX][posY] = 'H';
      this.state.lastMoveHit = true;
      this.state.lastShipHit = hitShip;
      shipBoard[posX][posY] = undefined;
      BattleShipGame._detectSunkenShip(shipBoard, hitShip, sunkenShips);
      if (sunkenShips.length === 5) {
        // When the game is won
        this.state.winner = playerID;
        this.state.internalState = 'GAME_END';
        this._updateExternalState();
      } else this.state.turnPlayer = opponentID;
    }
  }

  /**
   * Update state.status based on the current value of status.internalState. This allows the more complicated
   * state transitions to exist within the implementation but still conform to the primary game interface in
   * Covey.Town.
   * External States:'IN_PROGRESS', 'WAITING_TO_START', 'OVER'
   * Internal States:'GAME_WAIT', 'GAME_START', 'GAME_MAIN', 'GAME_END', possibly additional for SALVO
   */
  protected _updateExternalState(): void {
    switch (this.state.internalState) {
      case 'GAME_WAIT':
        this.state.status = 'WAITING_TO_START';
        break;
      case 'GAME_START':
      case 'GAME_MAIN':
        this.state.status = 'IN_PROGRESS';
        break;
      case 'GAME_END':
        this.state.status = 'OVER';
        break;
      default:
        // This should not ever be the case as of now.
        break;
    }
  }

  /**
   * Stores relevant game conclusion information to a GameHistory database.
   */
  protected _appendGameHistory(winner: Player, loser: Player, remainingShips: number): void {
    throw new Error(
      `${this.id} ${winner.id} ${loser.id} ${remainingShips} Method not implemented.`,
    );
  }
}
