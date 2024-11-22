import { Button, Center, Text, useToast } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { BattleShipBoardsView } from './BattleShipBoardsView';

interface BattleShipGameMainViewProps {
  interactableID: InteractableID;
  gameModel: GameInstance<BattleShipGameState>;
}

export function BattleShipGameMainView({
  interactableID,
  gameModel,
}: BattleShipGameMainViewProps): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const townController = useTownController();
  const toast = useToast();

  // By storing the usernames, we can still show the boards with the correct
  // usernames if the game ends due to someone leaving.
  const [p1Username, setP1Username] = useState<string>('Player 1');
  const [p2Username, setP2Username] = useState<string>('Player 2');

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

  async function onBoardCellClick(x: number, y: number) {
    try {
      await gameAreaController.makeAttackMove(x, y);
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
            ? 5 - gameModel.state.p1SunkenShips.length
            : isP2()
            ? 5 - gameModel.state.p2SunkenShips.length
            : 5 - gameModel.state.p1SunkenShips.length
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
            ? 5 - gameModel.state.p2SunkenShips.length
            : isP2()
            ? 5 - gameModel.state.p1SunkenShips.length
            : 5 - gameModel.state.p2SunkenShips.length
        }
        rightBoardClickCallback={onBoardCellClick}></BattleShipBoardsView>
      <br />
      <Center>
        <Text>
          {isPlayer()
            ? gameModel.state.turnPlayer === townController.ourPlayer.id
              ? "It's your turn. Click one of the squares on the right to attack that spot!"
              : "It's not your turn right now."
            : `It is currently ${
                gameAreaController.players.find(value => value.id === gameModel.state.turnPlayer)
                  ?.userName ?? gameModel.state.turnPlayer === gameModel.state.p1
                  ? 'Player 1'
                  : 'Player 2'
              }'s turn.`}
        </Text>
        <Button hidden={true}>Return</Button>
      </Center>
    </div>
  );
}
