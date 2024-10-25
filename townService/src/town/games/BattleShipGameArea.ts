import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import GameArea from './GameArea';

export default class BattleShipGameArea extends GameArea<BattleShipGame> {
  protected getType(): InteractableType {
    throw new Error(`${this.id} Method not implemented.`);
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error(`${this.id} ${command.type} ${player.id} Method not implemented.`);
  }
}
