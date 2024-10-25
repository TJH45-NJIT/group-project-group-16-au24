import {
  BattleShipGameState,
  GameArea,
  GameMoveCommand,
  GameStatus,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

// These error messages were taken from IP2.
export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type BattleShipEvents = GameEventTypes;

export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
  public isActive(): boolean {
    throw new Error(`${this.id} Method not implemented.`);
  }
}
