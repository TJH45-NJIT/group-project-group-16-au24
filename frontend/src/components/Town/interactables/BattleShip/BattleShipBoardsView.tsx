import { Center, Table, Td, Tr, Text, Thead, Tbody } from '@chakra-ui/react';
import React from 'react';
import { BattleShipBoardMarker, BattleShipBoardPiece } from '../../../../types/CoveyTownSocket';
import { BattleShipBoard } from './BattleShipBoard';

const DIVIDER_THICKNESS = 5;
const DIVIDER_COLOR = 'black';

function TextCell({ text }: { text: string }): JSX.Element {
  return (
    <Td borderWidth={0}>
      <Center>
        <Text>{text}</Text>
      </Center>
    </Td>
  );
}

interface BattleShipBoardsViewProps {
  leftPlayerName: string;
  leftInitialBoard: readonly (readonly BattleShipBoardPiece[])[];
  leftDisplayInitialBoard: boolean;
  leftMarkerBoard: readonly (readonly BattleShipBoardMarker[])[];
  leftShipsRemaining: number;
  leftBoardClickCallback?(x: number, y: number): void;
  rightPlayerName: string;
  rightInitialBoard: readonly (readonly BattleShipBoardPiece[])[];
  rightDisplayInitialBoard: boolean;
  rightMarkerBoard: readonly (readonly BattleShipBoardMarker[])[];
  rightShipsRemaining: number;
  rightBoardClickCallback?(x: number, y: number): void;
}

export function BattleShipBoardsView({
  leftPlayerName,
  leftInitialBoard,
  leftDisplayInitialBoard,
  leftMarkerBoard,
  leftShipsRemaining,
  leftBoardClickCallback = () => {},
  rightPlayerName,
  rightInitialBoard,
  rightDisplayInitialBoard,
  rightMarkerBoard,
  rightShipsRemaining,
  rightBoardClickCallback = () => {},
}: BattleShipBoardsViewProps): JSX.Element {
  return (
    <Table>
      <Thead>
        <Tr>
          <TextCell text={leftPlayerName} />
          <TextCell text={rightPlayerName} />
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td borderWidth={0} borderRightWidth={DIVIDER_THICKNESS} borderColor={DIVIDER_COLOR}>
            <Center>
              <BattleShipBoard
                initialBoard={leftInitialBoard}
                displayInitialBoard={leftDisplayInitialBoard}
                markerBoard={leftMarkerBoard}
                onCellClick={leftBoardClickCallback}
              />
            </Center>
          </Td>
          <Td borderWidth={0} borderLeftWidth={DIVIDER_THICKNESS} borderColor={DIVIDER_COLOR}>
            <Center>
              <BattleShipBoard
                initialBoard={rightInitialBoard}
                displayInitialBoard={rightDisplayInitialBoard}
                markerBoard={rightMarkerBoard}
                onCellClick={rightBoardClickCallback}
              />
            </Center>
          </Td>
        </Tr>
        <Tr>
          <TextCell text={`${leftShipsRemaining} Ships Remaining`} />
          <TextCell text={`${rightShipsRemaining} Ships Remaining`} />
        </Tr>
      </Tbody>
    </Table>
  );
}
