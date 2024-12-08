import {
  Center,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  StackDivider,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  BattleShipGameState,
  BattleShipGameStatus,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import { BattleShipGameMainView } from './BattleShipGameMainView';
import { BattleShipGameStartView } from './BattleShipGameStartView';
import { BattleShipGameWaitView } from './BattleShipGameWaitView';

function BattleShipArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const [gameModel, setGameModel] = useState<GameInstance<BattleShipGameState>>();
  // Having a separate internalState state instead of just using the model guarantees that
  // this internalState will always be defined, making the conditionals in the return cleaner.
  const [internalState, setInternalState] = useState<BattleShipGameStatus>('GAME_WAIT');

  useEffect(() => {
    const deliverUpdatedModel = () => {
      const gameModelRaw = gameAreaController.toInteractableAreaModel().game;
      if (gameModelRaw !== undefined) setInternalState(gameModelRaw.state.internalState);
      else setInternalState('GAME_WAIT');
      setGameModel(gameModelRaw);
    };
    gameAreaController.addListener('gameUpdated', deliverUpdatedModel);
    deliverUpdatedModel();
    return () => {
      gameAreaController.removeListener('gameUpdated', deliverUpdatedModel);
    };
  }, [gameAreaController]);

  return (
    <StackDivider>
      {internalState === 'GAME_WAIT' ? (
        <BattleShipGameWaitView interactableID={interactableID} gameModel={gameModel} />
      ) : internalState === 'GAME_START' ? (
        <BattleShipGameStartView
          interactableID={interactableID}
          gameModel={gameModel as unknown as GameInstance<BattleShipGameState>}
        />
      ) : internalState === 'GAME_MAIN' || internalState === 'GAME_END' ? (
        <BattleShipGameMainView
          interactableID={interactableID}
          gameModel={gameModel as unknown as GameInstance<BattleShipGameState>}
        />
      ) : (
        <Center>
          <Text>An unexpected error occurred.</Text>
        </Center>
      )}
    </StackDivider>
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
