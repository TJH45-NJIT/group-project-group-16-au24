import { Button, Center, StackDivider, Text, useToast } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { BattleShipMenuHistory } from './BattleShipMenuHistory';
import { BattleShipMenuLeaderboards } from './BattleShipMenuLeaderboards';
import { BattleShipMenuRules } from './BattleShipMenuRules';

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

  const [currentMenu, setCurrentMenu] = useState<JSX.Element>();
  const exitMenuCallback = useCallback(() => {
    setCurrentMenu(undefined);
  }, []);
  const menus = {
    RULES: <BattleShipMenuRules key='RULES' exitMenuCallback={exitMenuCallback} />,
    LEADERBOARD: (
      <BattleShipMenuLeaderboards
        key='LEADERBOARD'
        interactableID={interactableID}
        exitMenuCallback={exitMenuCallback}
      />
    ),
    HISTORY: (
      <BattleShipMenuHistory
        key='HISTORY'
        interactableID={interactableID}
        exitMenuCallback={exitMenuCallback}
      />
    ),
  };

  useEffect(() => {
    gameAreaController.sendRequestSafely(async () => {
      await gameAreaController.getHistory();
    }, toast);
  }, [gameAreaController, toast]);

  async function onJoinButtonClick() {
    await gameAreaController.sendRequestSafely(async () => {
      await gameAreaController.joinGame();
    }, toast);
  }

  return (
    <StackDivider>
      {currentMenu ? (
        currentMenu
      ) : (
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
            <Button
              margin={BUTTON_MARGIN}
              onClick={() => {
                setCurrentMenu(menus.RULES);
              }}>
              View Rules
            </Button>
            <Button
              margin={BUTTON_MARGIN}
              onClick={() => {
                setCurrentMenu(menus.LEADERBOARD);
              }}>
              View Leaderboards
            </Button>
            <Button
              margin={BUTTON_MARGIN}
              onClick={() => {
                setCurrentMenu(menus.HISTORY);
              }}>
              View Game History
            </Button>
          </Center>
        </StackDivider>
      )}
    </StackDivider>
  );
}
