import { Button, Center, StackDivider, Text } from '@chakra-ui/react';
import React from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { TEXT_ALIGN } from './BattleShipBoardsView';

const BUTTON_MARGIN = 5;

interface BattleShipGameWaitViewProps {
  interactableID: InteractableID;
  gameModel: GameInstance<BattleShipGameState>;
}

export function BattleShipGameWaitView({
  interactableID,
  gameModel,
}: BattleShipGameWaitViewProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  return (
    <Center>
      <Text style={{ textAlign: TEXT_ALIGN }}>{gameModel.players.length}/2 Players</Text>
      <Center>
        <StackDivider>
          <Button
            margin={BUTTON_MARGIN}
            disabled={
              gameModel.players.length <
              2 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: && !gameAreaController.isPlayer() */
            }>
            Join Game
          </Button>
        </StackDivider>
      </Center>
      <Center>
        <Button margin={BUTTON_MARGIN}>View Leaderboards</Button>
        <Button margin={BUTTON_MARGIN}>View Game History</Button>
      </Center>
    </Center>
  );
}
