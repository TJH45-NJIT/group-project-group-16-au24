import { Button, Center, StackDivider, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
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
  const [footer, setFooter] = useState<string>('');

  async function onBoardCellClick(x: number, y: number) {
    await gameAreaController.sendRequestSafely(async () => {
      await gameAreaController.makeAttackMove(x, y);
    }, toast);
  }

  async function onNewGameButtonClick() {
    await gameAreaController.sendRequestSafely(async () => {
      await gameAreaController.resetGame();
    }, toast);
  }

  useEffect(() => {
    if (gameModel.state.lastMoveHit) {
      if (gameAreaController.isPlayer) {
        if (gameAreaController.isP1) {
          if (gameModel.state.turnPlayer === townController.ourPlayer.id) {
            if (gameModel.state.p1SunkenShips.includes(gameModel.state.lastShipHit)) {
              toast({
                description: `Your ${gameModel.state.lastShipHit} was sunk!!!`,
                status: 'error',
              });
            } else {
              toast({
                description: `Your ${gameModel.state.lastShipHit} was hit!`,
                status: 'error',
              });
            }
          } else {
            if (gameModel.state.p2SunkenShips.includes(gameModel.state.lastShipHit)) {
              toast({
                description: `You sank a ${gameModel.state.lastShipHit}!!!`,
                status: 'success',
              });
            } else {
              toast({
                description: `You hit a ${gameModel.state.lastShipHit}!`,
                status: 'success',
              });
            }
          }
        } else {
          if (gameModel.state.turnPlayer === townController.ourPlayer.id) {
            if (gameModel.state.p2SunkenShips.includes(gameModel.state.lastShipHit)) {
              toast({
                description: `Your ${gameModel.state.lastShipHit} was sunk!!!`,
                status: 'error',
              });
            } else {
              toast({
                description: `Your ${gameModel.state.lastShipHit} was hit!`,
                status: 'error',
              });
            }
          } else {
            if (gameModel.state.p1SunkenShips.includes(gameModel.state.lastShipHit)) {
              toast({
                description: `You sank a ${gameModel.state.lastShipHit}!!!`,
                status: 'success',
              });
            } else {
              toast({
                description: `You hit a ${gameModel.state.lastShipHit}!`,
                status: 'success',
              });
            }
          }
        }
      } else {
        if (gameModel.state.turnPlayer === gameModel.state.p1) {
          if (gameModel.state.p1SunkenShips.includes(gameModel.state.lastShipHit)) {
            toast({
              description: `${gameModel.state.p2Username} sank a ${gameModel.state.lastShipHit}!!!`,
              status: 'error',
            });
          } else {
            toast({
              description: `${gameModel.state.p2Username} hit a ${gameModel.state.lastShipHit}!`,
              status: 'error',
            });
          }
        } else {
          if (gameModel.state.p2SunkenShips.includes(gameModel.state.lastShipHit)) {
            toast({
              description: `${gameModel.state.p1Username} sank a ${gameModel.state.lastShipHit}!!!`,
              status: 'error',
            });
          } else {
            toast({
              description: `${gameModel.state.p1Username} hit a ${gameModel.state.lastShipHit}!`,
              status: 'error',
            });
          }
        }
      }
    }
    if (gameModel.state.internalState === 'GAME_END') {
      setFooter(
        `The winner is ${
          gameModel.state.winner === gameModel.state.p1
            ? gameModel.state.p1Username
            : gameModel.state.p2Username
        }!`,
      );
    } else {
      if (gameAreaController.isPlayer) {
        setFooter(
          gameModel.state.turnPlayer === townController.ourPlayer.id
            ? "It's your turn. Click one of the squares on the right to attack that spot!"
            : "It's not your turn right now.",
        );
      } else {
        setFooter(
          `It is currently ${
            gameModel.state.turnPlayer === gameModel.state.p1
              ? gameModel.state.p1Username
              : gameModel.state.p2Username
          }'s turn.`,
        );
      }
    }
  }, [
    gameAreaController.isPlayer,
    gameAreaController.isP1,
    gameModel.state.internalState,
    gameModel.state.p1,
    gameModel.state.lastMoveHit,
    gameModel.state.lastShipHit,
    gameModel.state.p1SunkenShips,
    gameModel.state.p2SunkenShips,
    gameModel.state.p1Username,
    gameModel.state.p2Username,
    gameModel.state.turnPlayer,
    gameModel.state.winner,
    townController.ourPlayer.id,
    toast,
  ]);

  return (
    <StackDivider>
      <BattleShipBoardsView
        leftPlayerName={gameAreaController.isPlayer ? 'You' : gameModel.state.p1Username}
        leftInitialBoard={
          gameAreaController.isP2 ? gameModel.state.p2InitialBoard : gameModel.state.p1InitialBoard
        }
        leftDisplayInitialBoard={
          gameAreaController.isPlayer || gameModel.state.internalState === 'GAME_END'
        }
        leftMarkerBoard={
          gameAreaController.isP2 ? gameModel.state.p2MarkerBoard : gameModel.state.p1MarkerBoard
        }
        leftShipsRemaining={
          gameAreaController.isP2
            ? 5 - gameModel.state.p2SunkenShips.length
            : 5 - gameModel.state.p1SunkenShips.length
        }
        rightPlayerName={
          gameAreaController.isP2 ? gameModel.state.p1Username : gameModel.state.p2Username
        }
        rightInitialBoard={
          gameAreaController.isP2 ? gameModel.state.p1InitialBoard : gameModel.state.p2InitialBoard
        }
        rightDisplayInitialBoard={gameModel.state.internalState === 'GAME_END'}
        rightMarkerBoard={
          gameAreaController.isP2 ? gameModel.state.p1MarkerBoard : gameModel.state.p2MarkerBoard
        }
        rightShipsRemaining={
          gameAreaController.isP2
            ? 5 - gameModel.state.p1SunkenShips.length
            : 5 - gameModel.state.p2SunkenShips.length
        }
        rightBoardClickCallback={onBoardCellClick}
      />
      <br />
      <Center>
        <Text>{footer}</Text>
      </Center>
      <br />
      <Center>
        <Button
          hidden={gameModel.state.internalState !== 'GAME_END'}
          onClick={onNewGameButtonClick}>
          New Game
        </Button>
      </Center>
    </StackDivider>
  );
}
