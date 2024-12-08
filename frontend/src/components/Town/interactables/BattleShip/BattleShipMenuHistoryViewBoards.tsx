import { Button, Center, StackDivider, Text } from '@chakra-ui/react';
import React from 'react';
import { BattleShipGameState, GameInstance } from '../../../../types/CoveyTownSocket';
import { BattleShipBoardsView } from './BattleShipBoardsView';

interface BattleShipMenuHistoryViewBoardsProps {
  gameModel: GameInstance<BattleShipGameState>;
  exitSubmenuCallback(): void;
}

export function BattleShipMenuHistoryViewBoards({
  gameModel,
  exitSubmenuCallback,
}: BattleShipMenuHistoryViewBoardsProps): JSX.Element {
  return (
    <StackDivider>
      <BattleShipBoardsView
        leftPlayerName={gameModel.state.p1Username}
        leftInitialBoard={gameModel.state.p1InitialBoard}
        leftDisplayInitialBoard={true}
        leftMarkerBoard={gameModel.state.p1MarkerBoard}
        leftShipsRemaining={5 - gameModel.state.p1SunkenShips.length}
        rightPlayerName={gameModel.state.p2Username}
        rightInitialBoard={gameModel.state.p2InitialBoard}
        rightDisplayInitialBoard={true}
        rightMarkerBoard={gameModel.state.p2MarkerBoard}
        rightShipsRemaining={5 - gameModel.state.p2SunkenShips.length}
      />
      <Center>
        <Text>
          {gameModel.state.p1SunkenShips.length === 5 || gameModel.state.p2SunkenShips.length === 5
            ? 'The game ended normally.'
            : 'The game ended early due to leaving early.'}
        </Text>
      </Center>
      <br />
      <Center>
        <Button onClick={exitSubmenuCallback}>Back</Button>
      </Center>
    </StackDivider>
  );
}
