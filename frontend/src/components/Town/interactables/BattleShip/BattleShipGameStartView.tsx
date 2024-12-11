import { Button, Center, StackDivider, Text, useToast } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import {
  BattleShipBoardPiece,
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { BattleShipSetupBoard } from './BattleShipSetupBoard';

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
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const toast = useToast();
  const [mounted, setMounted] = useState<boolean>(false); // Prevents a memory leak warning
  const [changesSubmitted, setChangesSubmitted] = useState<boolean>(false);

  const [initialBoard, setInitialBoard] = useState<BattleShipBoardPiece[][]>([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);

  const updateInitialBoard = useCallback((newBoard: BattleShipBoardPiece[][]) => {
    setInitialBoard(newBoard);
  }, []);

  async function onSubmitButtonClick() {
    if (mounted) {
      if (
        await gameAreaController.sendRequestSafely(async () => {
          await gameAreaController.makeSetupMove(initialBoard);
        }, toast)
      )
        setChangesSubmitted(true);
    }
  }

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  return (
    <StackDivider>
      {gameAreaController.isPlayer ? (
        <StackDivider>
          <Center>
            <BattleShipSetupBoard deliverModifiedBoard={updateInitialBoard} />
          </Center>
          <br />
          <Center>
            <Text>Left click and drag your ships to where you want them to be placed.</Text>
          </Center>
          <Center>
            <Text>
              Right click on a ship to rotate it, which will only work if there is enough space.
            </Text>
          </Center>
          <Center>
            <Text>
              All ships must be completely enclosed within the middle 10×10 squares for the board to
              be considered valid.
            </Text>
          </Center>
          <Center>
            <Text>
              When you are ready to submit your board and start the game, click the button below.
            </Text>
          </Center>
          <br />
          <Center>
            <Button onClick={onSubmitButtonClick} disabled={changesSubmitted}>
              Submit
            </Button>
          </Center>
          <br />
          <Center>
            <Text>
              {gameAreaController.isP1
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
