import { Button, Center, StackDivider, Table, Tbody, Td, Text, Thead, Tr } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';

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
  const tableBody = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    const leaderboard = gameAreaController.leaderboard;
    if (tableBody.current === null) {
      exitMenuCallback();
      return;
    }
    if (leaderboard.size === 0)
      tableBody.current.append('There are no entries to display at the moment.');
    else
      for (const entry of leaderboard) {
        const row = new HTMLTableRowElement();
        const nameCell = new HTMLTableCellElement();
        const winsCell = new HTMLTableCellElement();
        nameCell.innerText = entry[0];
        winsCell.innerText = entry[1].toString();
        row.append(nameCell, winsCell);
        tableBody.current.append(row);
      }
  }, [exitMenuCallback, gameAreaController.leaderboard]);

  return (
    <StackDivider>
      <Center>
        <Text h={3}>Leaderboards</Text>
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
                <b>Player</b>
              </Td>
              <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
                <b>Wins</b>
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
  );
}
