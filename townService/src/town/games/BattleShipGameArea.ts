import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipGameState,
  BattleShipMove,
  GameInstance,
  GameMoveCommand,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  LeaveGameCommand,
  NewGameCommand,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import GameArea from './GameArea';

export default class BattleShipGameArea extends GameArea<BattleShipGame> {
  gameHistory: BattleShipGame[] = [];

  // eslint-disable-next-line class-methods-use-this
  protected getType(): InteractableType {
    return 'BattleShipArea';
  }

  /**
   * Deals with join game commands
   * Helper Method handle command
   * @param player The player who sent the command
   */
  public handleJoinCommand<CommandType extends InteractableCommand>(
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game === undefined) this._game = new BattleShipGame();
    this._game.join(player);
    this._emitAreaChanged();
    return { gameID: this._game.id } as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Deals with Leave game commands
   * Helper Method handle command
   * @param command The sent command
   * @param player The player who sent the command
   */
  public handleLeaveCommand<CommandType extends InteractableCommand>(
    command: LeaveGameCommand,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game === undefined) throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.gameID)
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    this._game.leave(player);
    this._emitAreaChanged();
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Deals with GameMove game commands
   * Helper Method handle command
   * @param command The sent command
   * @param player The player who sent the command
   */
  public handleGameMoveCommand<CommandType extends InteractableCommand>(
    command: GameMoveCommand<BattleShipMove>,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game === undefined) throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.gameID)
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    this._game.applyMove({
      gameID: command.gameID,
      playerID: player.id,
      move: command.move,
    });
    this._emitAreaChanged();
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Deals with NewGameCommands commands
   * Helper Method handle command
   * @param command The sent command
   */
  public handleNewGameCommand<CommandType extends InteractableCommand>(
    command: NewGameCommand,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game === undefined) throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.prevgameID)
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    if (this._game?.state.status === 'OVER') {
      this.gameHistory.push(this._game);
      this._game = undefined;
      this._emitAreaChanged();
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Deals with NewGameCommands commands
   * Helper Method handle command
   * @param command The sent command
   * scores: { [p1]: this.gameHistory[i].state.p2SunkenShips.length }, -- this might cuase errors later
   */
  public handleGetHistoryCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    const gameHistoryInstanceList: GameInstance<BattleShipGameState>[] = [];
    for (let i = 0; i < this.gameHistory.length; i++) {
      const { p1 } = this.gameHistory[i].state;
      const { p2 } = this.gameHistory[i].state;
      if (p1 && p2)
        gameHistoryInstanceList.push({
          state: this.gameHistory[i].state,
          id: this.gameHistory[i].id,
          players: [p1, p2],
          result: {
            gameID: this.gameHistory[i].id,
            scores: {
              [p1]: this.gameHistory[i].state.p2SunkenShips.length,
              [p2]: this.gameHistory[i].state.p1SunkenShips.length,
            },
          },
        });
    }
    return { gameHistory: gameHistoryInstanceList } as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Handle all commands sent to the game, diverting them to other backend functions as necessary. Errors
   * should be propagated to the frontend when they occur as UI messages explaining the error.
   * @param command The sent command
   * @param player The player who sent the command
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinGame') return this.handleJoinCommand(player);
    if (command.type === 'LeaveGame') return this.handleLeaveCommand(command, player);
    if (command.type === 'GameMove') return this.handleGameMoveCommand(command, player);
    if (command.type === 'NewGame') return this.handleNewGameCommand(command);
    if (command.type === 'GetHistory') return this.handleGetHistoryCommand();
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
