import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import GameArea from './GameArea';

export default class BattleShipGameArea extends GameArea<BattleShipGame> {
  // eslint-disable-next-line class-methods-use-this
  protected getType(): InteractableType {
    return 'BattleShipArea';
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
    throw new Error(`${this.id} ${command.type} ${player.id} Method not implemented.`);
  }
}
