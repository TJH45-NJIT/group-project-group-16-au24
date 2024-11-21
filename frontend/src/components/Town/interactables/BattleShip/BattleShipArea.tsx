import {
  Center,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import { BattleShipGameStartView } from './BattleShipGameStartView';

function BattleShipArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const [gameModel, setGameModel] = useState<GameInstance<BattleShipGameState>>();

  useEffect(() => {
    const deliverUpdatedModel = () => {
      const gameModelRaw = gameAreaController.toInteractableAreaModel().game;
      if (gameModelRaw !== undefined) setGameModel(gameModelRaw);
      else console.log('Problem!');
    };
    const updateListener = () => deliverUpdatedModel();
    gameAreaController.addListener('gameUpdated', updateListener);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateListener);
    };
  }, [gameAreaController]);

  return (
    <div>
      {gameModel !== undefined ? (
        <BattleShipGameStartView
          interactableID={interactableID}
          gameModel={gameModel}></BattleShipGameStartView>
      ) : (
        <Center>
          <Text>An unexpected error occurred.</Text>
        </Center>
      )}
    </div>
  );
}

// Most of the below method was taken from IP2.
/**
 * A wrapper component for the BattleShipArea component.
 * Determines if the player is currently in a BattleShipArea on the map, and if so,
 * renders the BattleShipArea component in a modal.
 */
export default function BattleShipAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'BattleShip') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='6xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <BattleShipArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
