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

  // This hardcoded initial board is temporary and only here in the first place to get us through the demo.
  const [initialBoard, setInitialBoard] = useState<BattleShipBoardPiece[][]>([]);

  const updateInitialBoard = useCallback((newBoard: BattleShipBoardPiece[][]) => {
    setInitialBoard(newBoard);
    setChangesSubmitted(false);
  }, []);

  async function onSubmitButtonClick() {
    if (mounted) {
      try {
        await gameAreaController.makeSetupMove(initialBoard);
        setChangesSubmitted(true);
      } catch (anyException) {
        if (anyException instanceof Error) {
          const error: Error = anyException;
          toast({
            description: error.message,
            status: 'error',
          });
        } else {
          toast({
            description: 'An unexpected error occurred.',
            status: 'error',
          });
        }
      }
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
            <Button onClick={onSubmitButtonClick} disabled={changesSubmitted}>
              Submit
            </Button>
          </Center>
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
