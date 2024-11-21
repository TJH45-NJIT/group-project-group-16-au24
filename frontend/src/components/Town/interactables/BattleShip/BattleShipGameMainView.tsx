import { Button, Center, Text } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { BattleShipBoardsView, TEXT_ALIGN } from './BattleShipBoardsView';

interface BattleShipMainGameViewProps {
  interactableID: InteractableID;
  gameModel: GameInstance<BattleShipGameState>;
}

export function BattleShipMainGameView({
  interactableID,
  gameModel,
}: BattleShipMainGameViewProps): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const townController = useTownController();

  // By storing the usernames, we can still show the boards with the correct
  // usernames if the game ends due to someone leaving.
  const [p1Username, setP1Username] = useState<string>('Player 1');
  const [p2Username, setP2Username] = useState<string>('Player 1');

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
  const isP2 = useCallback((): boolean => {
    return townController.ourPlayer.id === gameModel.state.p2;
  }, [gameModel.state.p2, townController.ourPlayer.id]);

  useEffect(() => {
    if (gameAreaController.players.length !== 2) return;
    setP1Username(
      gameAreaController.players.find(value => value.id === gameModel.state.p1)?.userName ??
        'Player 1',
    );
    setP2Username(
      gameAreaController.players.find(value => value.id === gameModel.state.p2)?.userName ??
        'Player 2',
    );
  }, [gameAreaController.players, gameModel.state.p1, gameModel.state.p2]);

  return (
    <div>
      <BattleShipBoardsView
        leftPlayerName={isPlayer() ? 'You' : p1Username}
        leftInitialBoard={
          isP1()
            ? gameModel.state.p1InitialBoard
            : isP2()
            ? gameModel.state.p2InitialBoard
            : gameModel.state.p1InitialBoard
        }
        leftDisplayInitialBoard={isPlayer() || gameModel.state.internalState === 'GAME_END'}
        leftMarkerBoard={
          isP1()
            ? gameModel.state.p1MarkerBoard
            : isP2()
            ? gameModel.state.p2MarkerBoard
            : gameModel.state.p1MarkerBoard
        }
        leftShipsRemaining={
          isP1()
            ? 0 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: 5 - gameModel.state.p1SunkenShips.length */
            : isP2()
            ? 0 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: 5 - gameModel.state.p2SunkenShips.length */
            : 0 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: 5 - gameModel.state.p1SunkenShips.length */
        }
        rightPlayerName={
          isPlayer()
            ? gameAreaController.players.find(value => value.id !== townController.ourPlayer.id)
                ?.userName ?? 'Opponent'
            : p2Username
        }
        rightInitialBoard={
          isP1()
            ? gameModel.state.p2InitialBoard
            : isP2()
            ? gameModel.state.p1InitialBoard
            : gameModel.state.p2InitialBoard
        }
        rightDisplayInitialBoard={isPlayer() || gameModel.state.internalState === 'GAME_END'}
        rightMarkerBoard={
          isP1()
            ? gameModel.state.p2MarkerBoard
            : isP2()
            ? gameModel.state.p1MarkerBoard
            : gameModel.state.p2MarkerBoard
        }
        rightShipsRemaining={
          isP1()
            ? 0 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: 5 - gameModel.state.p2SunkenShips.length */
            : isP2()
            ? 0 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: 5 - gameModel.state.p1SunkenShips.length */
            : 0 /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: 5 - gameModel.state.p2SunkenShips.length */
        }></BattleShipBoardsView>
      <br />
      <Text style={{ textAlign: TEXT_ALIGN }}>
        {isPlayer()
          ? '' /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: gameModel.state.turnPlayer */ ===
            townController.ourPlayer.id
            ? 'It&apos;s your turn. Click one of the squares on the right to attack that spot!'
            : 'It&apos;s not your turn right now.'
          : `It is currently ${
              gameAreaController.players.find(
                value =>
                  value.id ===
                  '' /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: gameModel.state.turnPlayer */,
              )?.userName ??
              '' /* REPLACE (WHEN ACCESSIBLE VIA MERGE) WITH: gameModel.state.turnPlayer === gameModel.state.p1 ? 'Player 1' : 'Player 2' */
            }&apos;s turn.`}
      </Text>
      <Center>
        <Button>Return</Button>
      </Center>
    </div>
  );
}
