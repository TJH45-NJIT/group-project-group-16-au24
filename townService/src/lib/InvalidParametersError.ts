export const INVALID_MOVE_MESSAGE = 'Invalid move';
export const INVALID_COMMAND_MESSAGE = 'Invalid command';

export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game is not in progress';
export const GAME_OVER_MESSAGE = 'Game is over';
export const GAME_ID_MISSMATCH_MESSAGE = 'Game ID mismatch';

export const BOARD_POSITION_NOT_EMPTY_MESSAGE = 'Board position is not empty';
export const MOVE_NOT_YOUR_TURN_MESSAGE = 'Not your turn';

export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';

export const BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE = 'Duplicate %s found';
export const BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE = 'Incomplete %s';
/**
 * Multiple ships separated by @see BATTLESHIP_SETUP_SHIP_MISSING_SEPARATOR
 * ordered the same way as in the @see BattleShipBoardPiece declaration
 */
export const BATTLESHIP_SETUP_SHIP_MISSING_MESSAGE = 'Missing ship(s): %s';
export const BATTLESHIP_SETUP_SHIP_MISSING_SEPARATOR = ', ';

export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
