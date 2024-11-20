import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import { BattleShipBoardsView } from './BattleShipBoardsView';

function BattleShipArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const townController = useTownController();
  return (
    <div>
      <p>
        {gameAreaController.id} {townController.townID}
      </p>
      <BattleShipBoardsView
        leftPlayerName={'You'}
        leftInitialBoard={[]}
        leftDisplayInitialBoard={true}
        leftMarkerBoard={[]}
        leftShipsRemaining={5}
        rightPlayerName={'Enemy Dude'}
        rightInitialBoard={[]}
        rightDisplayInitialBoard={true}
        rightMarkerBoard={[]}
        rightShipsRemaining={5}></BattleShipBoardsView>
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
