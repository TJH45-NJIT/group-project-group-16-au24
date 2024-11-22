import {
  GameArea,
  GameStatus,
  GameMoveCommand,
  BattleShipMove,
  BattleShipGameStatus,
  BattleShipGameState,
  BattleShipBoardMarker,
  BattleShipBoardPiece,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

// These error messages were taken from IP2.
export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export const NOT_SETUP_PHASE = 'Game is no longer in Setup Phase';
export const NOT_ATTACK_PHASE = 'Game is not in the Attack Phase';

export type BattleShipEvents = GameEventTypes & {
  shipBoardSet: (ourShipBoard: BattleShipBoardPiece[][] | undefined) => void;
  ourMarkerBoardChange: (ourMarkerBoard: BattleShipBoardMarker[][] | undefined) => void;
  theirMarkerBoardChange: (theirMarkerBoard: BattleShipBoardMarker[][] | undefined) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
  get ourShipBoard(): BattleShipBoardPiece[][] | undefined {
    if (this.isP2) {
      return this._model.game?.state.p2Board;
    }
    return this._model.game?.state.p1Board; //TODO Unsure how this will interact with forntend and where boards are updated
  } //TODO May need to take out the possibility of undefined return

  //Identifies the left MarkerBoard
  get ourMarkerBoard(): BattleShipBoardMarker[][] | undefined {
    if (this.isP2) {
      return this._model.game?.state.p2MarkerBoard;
    }
    return this._model.game?.state.p1MarkerBoard;
  }

  //Identifies the right MarkerBoard
  get theirMarkerBoard(): BattleShipBoardMarker[][] | undefined {
    if (this.isP2) {
      return this._model.game?.state.p1MarkerBoard;
    }
    return this._model.game?.state.p2MarkerBoard;
  }

  get p1(): PlayerController | undefined {
    const p1 = this._players.find(player => player.id === this._model.game?.state.p1);
    return p1;
  }

  get p2(): PlayerController | undefined {
    const p2 = this._players.find(player => player.id === this._model.game?.state.p2);
    return p2;
  }

  get winner(): PlayerController | undefined {
    const winner = this._players.find(player => player.id === this._model.game?.state.winner);
    return winner;
  }

  get whoseTurn(): PlayerController | undefined {
    const turnPlayer = this._players.find(
      player => player.id === this._model.game?.state.turnPlayer,
    );
    return turnPlayer;
  }

  get isOurTurn(): boolean {
    return this._townController.ourPlayer.id === this._model.game?.state.turnPlayer; //TODO Double check if working with backend turnPlayer properly
  }

  get hitOrMiss(): boolean {
    return false; //TODO Might be best to add a backend variables for this to check results of last attacking move
  }

  get lastShipHit(): BattleShipBoardPiece | undefined {
    return undefined; //TODO ^
  }

  get isLastShipSunk(): boolean {
    return false; //TODO ^
  }

  get isPlayer(): boolean {
    if (
      this._townController.ourPlayer.id === this.p1?.id ||
      this._townController.ourPlayer.id === this.p2?.id
    ) {
      return true;
    }
    return false;
  }

  get isP1(): boolean {
    return this._townController.ourPlayer.id === this.p1?.id;
  }

  get isP2(): boolean {
    return this._townController.ourPlayer.id === this.p2?.id;
  }

  get status(): GameStatus {
    return this._model.game?.state.status ?? 'WAITING_TO_START';
  }

  get internalState(): BattleShipGameStatus {
    return this._model.game?.state.internalState ?? 'GAME_WAIT';
  }

  public isActive(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  protected _updateFrom(newModel: GameArea<BattleShipGameState>): void {
    const oldState: BattleShipGameStatus = this.internalState;
    const lastTurnPlayer: PlayerController | undefined = this.whoseTurn;
    super._updateFrom(newModel);
    if (newModel.game === undefined) return;
    if (oldState === 'GAME_START' && this.internalState === 'GAME_MAIN')
      this.emit('shipBoardSet', this.ourShipBoard); //TODO May need a isPlayer check
    if (lastTurnPlayer === this.whoseTurn) return;
    if (this.isP2) {
      if (this.whoseTurn === this.p1) {
        this.emit('theirMarkerBoardChange', this.theirMarkerBoard);
      } else {
        this.emit('ourMarkerBoardChange', this.ourMarkerBoard);
      }
    } else {
      if (this.whoseTurn === this.p1) {
        this.emit('ourMarkerBoardChange', this.ourMarkerBoard);
      } else {
        this.emit('theirMarkerBoardChange', this.theirMarkerBoard);
      }
    }
    this.emit('turnChanged', this.isOurTurn);
  }

  public async makeSetupMove(initBoard: BattleShipBoardPiece[][]) {
    if (this._model.game === undefined || this._instanceID === undefined || !this.isActive())
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    if (this.internalState !== 'GAME_START') throw new Error(NOT_SETUP_PHASE);
    const setupCommand: GameMoveCommand<BattleShipMove> = {
      type: 'GameMove',
      gameID: this._instanceID,
      move: initBoard,
    };
    await this._townController.sendInteractableCommand(this._model.game.id, setupCommand);
  }

  public async makeAttackMove(posX: number, posY: number) {
    if (this._model.game === undefined || this._instanceID === undefined || !this.isActive())
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    if (this.internalState !== 'GAME_MAIN') throw new Error(NOT_ATTACK_PHASE);
    const attackCommand: GameMoveCommand<BattleShipMove> = {
      type: 'GameMove',
      gameID: this._instanceID,
      move: {
        posX: posX,
        posY: posY,
      },
    };
    await this._townController.sendInteractableCommand(this._model.game.id, attackCommand);
  }
}
