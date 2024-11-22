import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipMove,
  GameMoveCommand,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  JoinSpectatorCommand,
  LeaveGameCommand,
  LeaveSpectatorCommand,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import GameArea from './GameArea';

export default class BattleShipGameArea extends GameArea<BattleShipGame> {
  // eslint-disable-next-line class-methods-use-this
  playersInGame: Player[] = [];

  observersInGame: Player[] = [];

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
    this.playersInGame?.push(player);
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
    if (this._game === undefined) throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.gameID) throw new Error(GAME_ID_MISSMATCH_MESSAGE);
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
    if (this._game === undefined) throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.gameID) throw new Error(GAME_ID_MISSMATCH_MESSAGE);
    this._game.applyMove({
      gameID: command.gameID,
      playerID: player.id,
      move: command.move,
    });
    this._emitAreaChanged();
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Deals with Join Spectator commands
   * Helper Method handle command
   * @param command The sent command
   * @param player The player who sent the command
   */
  handleSpectatorJoinCommand<CommandType extends InteractableCommand>(
    command: JoinSpectatorCommand,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game === undefined) throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.gameID) throw new Error(GAME_ID_MISSMATCH_MESSAGE);
    this.observersInGame.push(player);
    this._occupants.push(player);
    this._emitAreaChanged();
    return { gameID: this._game.id } as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Deals with Leave Spectator commands
   * Helper Method handle command
   * @param command The sent command
   * @param player The player who sent the command
   */
  public handleSpectatorLeaveCommand<CommandType extends InteractableCommand>(
    command: LeaveSpectatorCommand,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game === undefined) throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    if (this._game.id !== command.gameID) throw new Error(GAME_ID_MISSMATCH_MESSAGE);
    this.observersInGame = this.observersInGame.filter(p => p.id !== player.id);
    this._occupants = this.occupants.filter(p => p.id !== player.id);
    this._emitAreaChanged();
    return undefined as InteractableCommandReturnType<CommandType>;
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
    if (command.type === 'JoinSpectator') return this.handleSpectatorJoinCommand(command, player);
    if (command.type === 'LeaveSpectator') return this.handleSpectatorLeaveCommand(command, player);
    throw new Error(INVALID_COMMAND_MESSAGE);
  }
}
