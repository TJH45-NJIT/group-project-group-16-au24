import { Button, Center, StackDivider, Table, Tbody, Td, Text, Thead, Tr } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';

// The linter won't let me put this in all caps.
const tableStyle = {
  borderWidth: 3,
  borderColor: 'black',
};

interface LeaderboardRow {
  username: string;
  wins: number;
}

interface BattleShipMenuLeaderboardsProps {
  interactableID: InteractableID;
  exitMenuCallback(): void;
}

export function BattleShipMenuLeaderboards({
  interactableID,
  exitMenuCallback,
}: BattleShipMenuLeaderboardsProps): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [rowsUpdateFlag, setRowsUpdateFlag] = useState<boolean>(false);

  useEffect(() => {
    if (rowsUpdateFlag) return;
    setRowsUpdateFlag(true);
    const leaderboard = gameAreaController.leaderboard;
    for (const entry of leaderboard)
      rows.push({
        username: entry[0],
        wins: entry[1],
      });
    setRows(rows);
  }, [gameAreaController.leaderboard, rows, rowsUpdateFlag]);

  return (
    <StackDivider>
      <Center>
        <Text>
          <b>Leaderboards</b>
        </Text>
      </Center>
      <Center>
        <Table marginLeft={'auto'} marginRight={'auto'} margin={5} {...tableStyle}>
          <Thead>
            <Tr>
              <Td {...tableStyle}>
                <Center>
                  <b>Player</b>
                </Center>
              </Td>
              <Td {...tableStyle}>
                <Center>
                  <b>Wins</b>
                </Center>
              </Td>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, index) => (
              <Tr key={index}>
                <Td {...tableStyle}>
                  <Center>{row.username}</Center>
                </Td>
                <Td {...tableStyle}>
                  <Center>{row.wins}</Center>
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
  );
}
