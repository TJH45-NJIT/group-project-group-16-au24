import { Button, Center, StackDivider, Text, useToast } from '@chakra-ui/react';
import React from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';

const BUTTON_MARGIN = 5;

interface BattleShipGameWaitViewProps {
  interactableID: InteractableID;
  gameModel: GameInstance<BattleShipGameState> | undefined;
}

export function BattleShipGameWaitView({
  interactableID,
  gameModel,
}: BattleShipGameWaitViewProps): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const toast = useToast();

  async function onJoinButtonClick() {
    try {
      await gameAreaController.joinGame();
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

  return (
    <StackDivider>
      {/* Using separate Center components causes child components to be in separate rows. */}
      <Center>
        <Text>{gameModel?.players.length ?? 0}/2 Players</Text>
      </Center>
      <Center>
        <Button
          margin={BUTTON_MARGIN}
          disabled={(gameModel?.players.length ?? 0) >= 2 || gameAreaController.isPlayer}
          onClick={onJoinButtonClick}>
          Join Game
        </Button>
      </Center>
      <Center>
        <Button margin={BUTTON_MARGIN}>View Leaderboards</Button>
        <Button margin={BUTTON_MARGIN}>View Game History</Button>
      </Center>
    </StackDivider>
  );
}
