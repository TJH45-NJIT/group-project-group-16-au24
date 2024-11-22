import { Button, Center, StackDivider, Text, useToast } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  BattleShipBoardPiece,
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { BattleShipBoard } from './BattleShipBoard';

const OPPONENT_READY_TEXT = 'Opponent is ready.';
const OPPONENT_NOT_READY_TEXT = 'Opponent is not ready yet.';

interface BattleShipGameStartViewProps {
  interactableID: InteractableID;
  gameModel: GameInstance<BattleShipGameState>;
}

export function BattleShipGameStartView({
  interactableID,
  gameModel,
}: BattleShipGameStartViewProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const townController = useTownController();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toast = useToast();

  // This hardcoded initial board is temporary and only here in the first place to get us through the demo.
  const [initialBoard] = useState<BattleShipBoardPiece[][]>([
    // eslint-disable-next-line prettier/prettier
    [    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,  'Destroyer' ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    'Carrier',    undefined,    undefined,    undefined,  'Submarine',  'Submarine',  'Submarine',    undefined,  'Destroyer' ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    'Carrier',    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    'Carrier',    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    'Carrier',    undefined,    undefined,    undefined,    undefined,    'Cruiser',    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    'Carrier',    undefined,    undefined,    undefined,    undefined,    'Cruiser',    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    'Cruiser',    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [ 'Battleship', 'Battleship', 'Battleship', 'Battleship',    undefined,    undefined,    undefined,    undefined,    undefined,    undefined ],
    // eslint-disable-next-line prettier/prettier
    [    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined,    undefined ],
  ]);

  // Temporary functions to be replaced with BattleShipAreaController
  // equivalents when that becomes available:
  const isPlayer = useCallback((): boolean => {
    return (
      townController.ourPlayer.id === gameModel.state.p1 ||
      townController.ourPlayer.id === gameModel.state.p2
    );
  }, [gameModel.state.p1, gameModel.state.p2, townController.ourPlayer.id]);
  const isP1 = useCallback((): boolean => {
    return townController.ourPlayer.id === gameModel.state.p1;
  }, [gameModel.state.p1, townController.ourPlayer.id]);

  async function onSubmitButtonClick() {
    await gameAreaController.makeSetupMove(initialBoard);
  }

  return (
    <StackDivider>
      {isPlayer() ? (
        <StackDivider>
          <Center>
            <BattleShipBoard /* This will eventually be replaced with a proper editable board. */
              initialBoard={initialBoard}
              displayInitialBoard={true}
              markerBoard={[]}></BattleShipBoard>
          </Center>
          <Center>
            <Text>
              <br />
              Click and drag your ships to where you want them to be placed.
              <br />
              When you are ready to start the game, click the button below.
              <br />
            </Text>
          </Center>
          <Center>
            <Button onClick={onSubmitButtonClick}>Submit</Button>
          </Center>
          <Center>
            <Text>
              {isP1()
                ? gameModel.state.p2InitialBoard.length === 0
                  ? OPPONENT_NOT_READY_TEXT
                  : OPPONENT_READY_TEXT
                : gameModel.state.p1InitialBoard.length === 0
                ? OPPONENT_NOT_READY_TEXT
                : OPPONENT_READY_TEXT}
            </Text>
          </Center>
        </StackDivider>
      ) : (
        <Center>
          <Text>
            The players are currently placing their ships. You will be able to watch the game when
            they finish setting up!
          </Text>
        </Center>
      )}
    </StackDivider>
  );
}
