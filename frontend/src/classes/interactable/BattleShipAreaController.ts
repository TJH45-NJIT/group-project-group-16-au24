import {
  GameArea,
  GameStatus,
  GameMoveCommand,
  BattleShipMove,
  BattleShipGameStatus,
  BattleShipGameState,
  BattleShipBoardPiece,
  NewGameCommand,
  GameInstance,
  GameResult,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

// These error messages were taken from IP2.
export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export const NOT_SETUP_PHASE = 'Game is no longer in Setup Phase';
export const NOT_ATTACK_PHASE = 'Game is not in the Attack Phase';

export type BattleShipEvents = GameEventTypes & {
  turnChanged: (isOurTurn: boolean) => void;
};

export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
  gameHistory: GameInstance<BattleShipGameState>[] = [];

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

  get leaderboard(): GameResult[] {
    const leaderboard: GameResult[] = [];
    for (let i = 0; i < this.gameHistory.length; i++) {
      const result = this.gameHistory[i].result;
      if (result) leaderboard.push(result);
    }
    return leaderboard;
  }

  public isActive(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  protected _updateFrom(newModel: GameArea<BattleShipGameState>): void {
    const lastTurnPlayer: PlayerController | undefined = this.whoseTurn;
    super._updateFrom(newModel);
    if (newModel.game === undefined) return;
    if (lastTurnPlayer === this.whoseTurn) return;
    this.emit('turnChanged', this.isOurTurn);
  }

  public async getHistory() {
    const { historyRecords } = await this._townController.sendInteractableCommand(this.id, {
      type: 'GetHistory',
    });
    this.gameHistory = historyRecords;
  }

  public async resetGame() {
    if (this._model.game === undefined || this._instanceID === undefined || !this.isActive())
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    if (this.internalState == 'GAME_END') {
      const newGameCommand: NewGameCommand = {
        type: 'NewGame',
        prevgameID: this._instanceID,
      };
      this.getHistory();
      await this._townController.sendInteractableCommand(this.id, newGameCommand);
    }
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
    await this._townController.sendInteractableCommand(this.id, setupCommand);
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
    await this._townController.sendInteractableCommand(this.id, attackCommand);
  }
}
