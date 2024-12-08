import { Button, Center, StackDivider, Table, Tbody, Td, Text, Thead, Tr } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import { BattleShipMenuHistoryViewBoards } from './BattleShipMenuHistoryViewBoards';

interface BattleShipMenuHistoryProps {
  interactableID: InteractableID;
  exitMenuCallback(): void;
}

export function BattleShipMenuHistory({
  interactableID,
  exitMenuCallback,
}: BattleShipMenuHistoryProps): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const tableBody = useRef<HTMLTableSectionElement>(null);

  const [boards, setBoards] = useState<JSX.Element>();
  const exitSubmenuCallback = useCallback(() => {
    setBoards(undefined);
  }, []);

  useEffect(() => {
    if (tableBody.current === null) {
      exitMenuCallback();
      return;
    }
    if (gameAreaController.gameHistory.length === 0)
      tableBody.current.append('There are no entries to display at the moment.');
    else
      for (const entry of gameAreaController.gameHistory) {
        const row = new HTMLTableRowElement();
        const winnerCell = new HTMLTableCellElement();
        const loserCell = new HTMLTableCellElement();
        const scoreCell = new HTMLTableCellElement();
        const boardCell = new HTMLTableCellElement();
        let winnerScore = 0;
        let loserScore = 0;
        if (entry.state.winner === entry.state.p1) {
          winnerCell.innerText = entry.state.p1Username;
          winnerScore = entry.result?.scores[entry.state.p1Username] ?? 0;
          loserCell.innerText = entry.state.p2Username;
          loserScore = entry.result?.scores[entry.state.p2Username] ?? 0;
        } else {
          winnerCell.innerText = entry.state.p2Username;
          winnerScore = entry.result?.scores[entry.state.p2Username] ?? 0;
          loserCell.innerText = entry.state.p1Username;
          loserScore = entry.result?.scores[entry.state.p1Username] ?? 0;
        }
        scoreCell.innerText = `${winnerScore} - ${loserScore}`;
        const button = new HTMLButtonElement();
        button.innerText = 'View';
        button.onclick = () => {
          setBoards(
            <BattleShipMenuHistoryViewBoards
              gameModel={entry}
              exitSubmenuCallback={exitSubmenuCallback}
            />,
          );
        };
        boardCell.appendChild(button);
        row.append(winnerCell, loserCell, scoreCell, boardCell);
        tableBody.current.append(row);
      }
  }, [
    exitMenuCallback,
    exitSubmenuCallback,
    gameAreaController.gameHistory,
    gameAreaController.leaderboard,
  ]);

  return (
    <StackDivider>
      {boards ? (
        boards
      ) : (
        <StackDivider>
          <Center>
            <Text h={3}>Game History</Text>
          </Center>
          <Center>
            <Table
              marginLeft={'auto'}
              marginRight={'auto'}
              borderWidth={3}
              borderColor={'black'}
              textAlign={'center'}
              margin={5}>
              <Thead>
                <Tr>
                  <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
                    <b>Winner</b>
                  </Td>
                  <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
                    <b>Loser</b>
                  </Td>
                  <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
                    <b>Score</b>
                  </Td>
                  <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
                    <b>Final Boards</b>
                  </Td>
                </Tr>
              </Thead>
              <Tbody ref={tableBody} />
            </Table>
          </Center>
          <br />
          <Center>
            <Button onClick={exitMenuCallback}>Back</Button>
          </Center>
        </StackDivider>
      )}
    </StackDivider>
  );
}
