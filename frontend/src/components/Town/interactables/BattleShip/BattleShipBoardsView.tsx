import { Center, Table, Td, Tr } from '@chakra-ui/react';
import React from 'react';
import { BattleShipBoardMarker, BattleShipBoardPiece } from '../../../../types/CoveyTownSocket';
import { BattleShipBoard } from './BattleShipBoard';

const DIVIDER_THICKNESS = 5;
const DIVIDER_COLOR = 'black';
export const TEXT_ALIGN = 'center';

interface BattleShipBoardsViewProps {
  leftPlayerName: string;
  leftInitialBoard: BattleShipBoardPiece[][];
  leftDisplayInitialBoard: boolean;
  leftMarkerBoard: BattleShipBoardMarker[][];
  leftShipsRemaining: number;
  leftBoardClickCallback?(x: number, y: number): void;
  rightPlayerName: string;
  rightInitialBoard: BattleShipBoardPiece[][];
  rightDisplayInitialBoard: boolean;
  rightMarkerBoard: BattleShipBoardMarker[][];
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
      <Tr>
        <Td borderWidth={0} textAlign={TEXT_ALIGN}>
          {leftPlayerName}
        </Td>
        <Td borderWidth={0} textAlign={TEXT_ALIGN}>
          {rightPlayerName}
        </Td>
      </Tr>
      <Tr>
        <Td borderWidth={0} borderRightWidth={DIVIDER_THICKNESS} borderColor={DIVIDER_COLOR}>
          <Center>
            <BattleShipBoard
              initialBoard={leftInitialBoard}
              displayInitialBoard={leftDisplayInitialBoard}
              markerBoard={leftMarkerBoard}
              onCellClick={leftBoardClickCallback}></BattleShipBoard>
          </Center>
        </Td>
        <Td borderWidth={0} borderLeftWidth={DIVIDER_THICKNESS} borderColor={DIVIDER_COLOR}>
          <Center>
            <BattleShipBoard
              initialBoard={rightInitialBoard}
              displayInitialBoard={rightDisplayInitialBoard}
              markerBoard={rightMarkerBoard}
              onCellClick={rightBoardClickCallback}></BattleShipBoard>
          </Center>
        </Td>
      </Tr>
      <Tr>
        <Td borderWidth={0} textAlign={TEXT_ALIGN}>
          {leftShipsRemaining} Ships Remaining
        </Td>
        <Td borderWidth={0} textAlign={TEXT_ALIGN}>
          {rightShipsRemaining} Ships Remaining
        </Td>
      </Tr>
    </Table>
  );
}
