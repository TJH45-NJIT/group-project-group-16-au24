import { Button, Center, StackDivider, Table, Tbody, Td, Text, Thead, Tr } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import {
  BattleShipGameState,
  GameInstance,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import { BattleShipMenuHistoryViewBoards } from './BattleShipMenuHistoryViewBoards';

// The linter won't let me put this in all caps.
const tableStyle = {
  borderWidth: 3,
  borderColor: 'black',
};

interface HistoryRow {
  winner: string;
  loser: string;
  score: string;
  gameModel: GameInstance<BattleShipGameState>;
}

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
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [rowsUpdateFlag, setRowsUpdateFlag] = useState<boolean>(false);

  const [boards, setBoards] = useState<JSX.Element>();
  const exitSubmenuCallback = useCallback(() => {
    setBoards(undefined);
  }, []);

  useEffect(() => {
    if (rowsUpdateFlag) return;
    setRowsUpdateFlag(true);
    for (let i = 0; i < gameAreaController.gameHistory.length; i++) {
      const entry = gameAreaController.gameHistory[i];
      let winner: string;
      let loser: string;
      let winnerScore = 0;
      let loserScore = 0;
      if (entry.state.winner === entry.state.p1) {
        winner = entry.state.p1Username;
        winnerScore = entry.result?.scores[entry.state.p1Username] ?? 0;
        loser = entry.state.p2Username;
        loserScore = entry.result?.scores[entry.state.p2Username] ?? 0;
      } else {
        winner = entry.state.p2Username;
        winnerScore = entry.result?.scores[entry.state.p2Username] ?? 0;
        loser = entry.state.p1Username;
        loserScore = entry.result?.scores[entry.state.p1Username] ?? 0;
      }
      rows.push({
        winner: winner,
        loser: loser,
        score: `${winnerScore} - ${loserScore}`,
        gameModel: entry,
      });
    }
    setRows(rows);
  }, [gameAreaController.gameHistory, rows, rowsUpdateFlag]);

  return (
    <StackDivider>
      {boards ? (
        boards
      ) : (
        <StackDivider>
          <Center>
            <Text>
              <b>Game History</b>
            </Text>
          </Center>
          <Center>
            <Table marginLeft={'auto'} marginRight={'auto'} margin={5} {...tableStyle}>
              <Thead>
                <Tr>
                  <Td {...tableStyle}>
                    <Center>
                      <b>Winner</b>
                    </Center>
                  </Td>
                  <Td {...tableStyle}>
                    <Center>
                      <b>Loser</b>
                    </Center>
                  </Td>
                  <Td {...tableStyle}>
                    <Center>
                      <b>Score</b>
                    </Center>
                  </Td>
                  <Td {...tableStyle}>
                    <Center>
                      <b>Final Boards</b>
                    </Center>
                  </Td>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((row, index) => (
                  <Tr key={index}>
                    <Td {...tableStyle}>
                      <Center>{row.winner}</Center>
                    </Td>
                    <Td {...tableStyle}>
                      <Center>{row.loser}</Center>
                    </Td>
                    <Td {...tableStyle}>
                      <Center>{row.score}</Center>
                    </Td>
                    <Td {...tableStyle}>
                      <Center>
                        <Button
                          onClick={() => {
                            setBoards(
                              <BattleShipMenuHistoryViewBoards
                                gameModel={row.gameModel}
                                exitSubmenuCallback={exitSubmenuCallback}
                              />,
                            );
                          }}>
                          View
                        </Button>
                      </Center>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Center>
          {rows.length === 0 ? (
            <Text>
              <Center>There are no entries to display at the moment.</Center>
            </Text>
          ) : (
            ''
          )}
          <br />
          <Center>
            <Button onClick={exitMenuCallback}>Back</Button>
          </Center>
        </StackDivider>
      )}
    </StackDivider>
  );
}
