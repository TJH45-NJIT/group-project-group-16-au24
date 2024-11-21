import { Button, Center, StackDivider, Text } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const townController = useTownController();
  const isPlayer = useCallback((): boolean => {
    return gameModel === undefined
      ? false
      : townController.ourPlayer.id === gameModel.state.p1 ||
          townController.ourPlayer.id === gameModel.state.p2;
  }, [gameModel, townController.ourPlayer.id]);
  return (
    <StackDivider>
      <Center>
        <Text>{gameModel?.players.length ?? 0}/2 Players</Text>
        <Button /* Having this Button in a separate Center component causes it to be above the other Buttons. */
          margin={BUTTON_MARGIN}
          disabled={(gameModel?.players.length ?? 0) >= 2 || isPlayer()}>
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
