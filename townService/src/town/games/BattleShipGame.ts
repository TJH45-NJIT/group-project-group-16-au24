import Player from '../../lib/Player';
import { BattleShipGameState, BattleShipMove, GameMove } from '../../types/CoveyTownSocket';
import Game from './Game';

export default class BattleShipGame extends Game<BattleShipGameState, BattleShipMove> {
  public applyMove(move: GameMove<BattleShipMove>): void {
    throw new Error(`${this.id} ${move.playerID} Method not implemented.`);
  }

  protected _join(player: Player): void {
    throw new Error(`${this.id} ${player.id} Method not implemented.`);
  }

  protected _leave(player: Player): void {
    throw new Error(`${this.id} ${player.id} Method not implemented.`);
  }
}
