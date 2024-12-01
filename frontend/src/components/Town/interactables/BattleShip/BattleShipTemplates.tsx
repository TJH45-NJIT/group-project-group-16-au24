/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Center, Table, Td, Tr } from '@chakra-ui/react';
import React from 'react';

// This file is a collection of templates I created for the "Wizard of Oz" demo, and I think we can reuse a good amount
// of this in the final version of the project. This file should be *DELETED* by the time the project is finished, with
// all of its components either moved/modified somewhere else or deleted. If any of these templates are used, their
// skeletons should definitely be heavily modified due to how much repetition there is.

function HistoryView(): JSX.Element {
  return (
    <div>
      <Center>
        <Table
          marginLeft={'auto'}
          marginRight={'auto'}
          borderWidth={3}
          borderColor={'black'}
          textAlign={'center'}
          margin={5}>
          <Tr>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <b>Winner</b>
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <b>Loser</b>
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <b>Ships Remaining</b>
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <b>Final Board</b>
            </Td>
          </Tr>
          <Tr>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              Andrew
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              Brian
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              4 - 0
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <Center>
                <Button>View</Button>
              </Center>
            </Td>
          </Tr>
        </Table>
      </Center>
      <Center>
        <Button margin={5}>Back</Button>
      </Center>
    </div>
  );
}

function LeaderboardView(): JSX.Element {
  return (
    <div>
      <Center>
        <Table
          marginLeft={'auto'}
          marginRight={'auto'}
          borderWidth={3}
          borderColor={'black'}
          textAlign={'center'}
          margin={5}>
          <Tr>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <b>Player</b>
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              <b>Wins</b>
            </Td>
          </Tr>
          <Tr>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              Andrew
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              1
            </Td>
          </Tr>
          <Tr>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              Brian
            </Td>
            <Td borderWidth={3} borderColor={'black'} textAlign={'center'}>
              0
            </Td>
          </Tr>
        </Table>
      </Center>
      <Center>
        <Button margin={5}>Back</Button>
      </Center>
    </div>
  );
}
