/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Center, Table, Td, Tr, useToast } from '@chakra-ui/react';
import React from 'react';
import { BattleShipBoard } from './BattleShipBoard';

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

function InMainGameView(): JSX.Element {
  return (
    <div>
      <Table textAlign={'center'}>
        <Tr>
          <Td borderWidth={0} textAlign={'center'}>
            Andrew (Winner)
          </Td>
          <Td borderWidth={0} textAlign={'center'}>
            Brian
          </Td>
        </Tr>
        <Tr>
          <Td borderWidth={0} borderRightWidth={5} borderColor={'black'}>
            <BattleShipBoard
              initialBoard={[]}
              displayInitialBoard={false}
              markerBoard={[]}></BattleShipBoard>
          </Td>
          <Td borderWidth={0} borderLeftWidth={5} borderColor={'black'}>
            <BattleShipBoard
              initialBoard={[]}
              displayInitialBoard={false}
              markerBoard={[]}></BattleShipBoard>
          </Td>
        </Tr>
        <Tr>
          <Td borderWidth={0} textAlign={'center'}>
            4 Ships Remaining
          </Td>
          <Td borderWidth={0} textAlign={'center'}>
            0 Ships Remaining
          </Td>
        </Tr>
      </Table>
      <br />
      <p style={{ textAlign: 'center' }}>
        It&apos;s your turn. Click one of the squares on the right to attack that spot!
      </p>
      <p style={{ textAlign: 'center' }}>It&apos;s not your turn right now.</p>
      <p style={{ textAlign: 'center' }}>It is currently Brian&apos;s turn.</p>
      <Center>
        <Button margin={5}>Back</Button>
      </Center>
    </div>
  );
}

function InitialGameView(): JSX.Element {
  const t = useToast();
  const doToast1 = () => {
    t({
      description: 'You won the game!',
      status: 'success',
    });
  };
  const doToast2 = () => {
    t({
      description: 'You lost the game!',
      status: 'error',
    });
  };
  return (
    <div style={{ alignContent: 'center' }}>
      <p style={{ textAlign: 'center' }}>0/2 Players</p>
      <Center>
        <div>
          <Button margin={5} disabled={false}>
            Join Game
          </Button>
        </div>
      </Center>
      <Center>
        <Button margin={5} onClick={doToast1}>
          View Leaderboards
        </Button>
        <Button margin={5} onClick={doToast2}>
          View Game History
        </Button>
      </Center>
    </div>
  );
}

function BoardSetupView(): JSX.Element {
  return (
    <div>
      <BattleShipBoard
        initialBoard={[]}
        displayInitialBoard={false}
        markerBoard={[]}></BattleShipBoard>
      <br />
      <p style={{ textAlign: 'center' }}>
        Click and drag your ships to where you want them to be placed.
        <br />
        When you are ready to start the game, click the button below.
      </p>
      <Center>
        <Button margin={5}>Submit</Button>
      </Center>
      {/* <p style={{'textAlign': 'center'}}>Opponent is not ready yet.</p> */}
      <p style={{ textAlign: 'center' }}>Opponent is ready.</p>
    </div>
  );
}
