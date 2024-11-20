import { 
  GameArea,
  GameStatus,
  GameMove,
  BattleShipMove,
  BattleShipGameState, 
  BattleShipBoardMarker, 
  BattleShipBoardPiece,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

// These error messages were taken from IP2.
export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type BattleShipEvents = GameEventTypes & {
  shipBoardSet: (ourShipBoard: BattleShipBoardPiece[][]) => void;
  ourMarkerBoardChange: (ourMarkerBoard: BattleShipBoardMarker[][]) => void;
  theirMarkerBoardChange: (theirMarkerBoard: BattleShipBoardMarker[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {

  get ourShipBoard(): BattleShipBoardPiece[][] | undefined {
    if(this._townController.ourPlayer.id == this.p2?.id){
      return this._model.game?.state.p2Board;
    }
    return this._model.game?.state.p1Board; //TODO: Unsure how this will interact with forntend and where boards are updated
  }

  get ourMarkerBoard(): BattleShipBoardMarker[][] | undefined {
    if(this._townController.ourPlayer.id == this.p2?.id){
      return this._model.game?.state.p2MarkerBoard;
    }
    return this._model.game?.state.p1MarkerBoard;
  }
  
  get theirMarkerBoard(): BattleShipBoardMarker[][] | undefined {
    if(this._townController.ourPlayer.id == this.p2?.id){
      return this._model.game?.state.p1MarkerBoard;
    }
    return this._model.game?.state.p2MarkerBoard;
  }

  get p1(): PlayerController | undefined {
    const p1 = this._players.find((player) => player.id == this._model.game?.state.p1);
    return p1;
  }

  get p2(): PlayerController | undefined {
    const p2 = this._players.find((player) => player.id == this._model.game?.state.p2);
    return p2;
  }

  get winner(): PlayerController | undefined {
    const winner = this._players.find((player) => player.id == this._model.game?.state.winner);
    return winner;
  }

  get isOurTurn(): boolean {
    return true; //TODO: Might be best to add a backend variables for this to check results of last attacking move
  }

  get hitOrMiss(): boolean {
    return false; //TODO: ^
  }

  get lastShipHit(): BattleShipBoardPiece | undefined {
    return undefined; //TODO: ^
  }

  get isLastShipSunk(): boolean {
    return false; //TODO: ^
  }

  get isPlayer(): boolean {
    if(this._townController.ourPlayer.id == this.p1?.id || this._townController.ourPlayer.id == this.p2?.id) {
      return true;
    }
    return false;
  }

  public isActive(): boolean {
    throw new Error(`${this.id} Method not implemented.`);
  }

  protected _updateFrom(newModel: GameArea<BattleShipGameState>): void {
    super._updateFrom(newModel);
    //TODO
  }

  public async makeSetupMove(initBoard: BattleShipBoardPiece[][]) {

    return; //TODO
  }

  public async makeAttackMove(posX: number, posY: number) {

    return; //TODO
  }
}