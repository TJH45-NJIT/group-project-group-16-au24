import { Button, Center, List, StackDivider, Text, UnorderedList } from '@chakra-ui/react';
import React from 'react';

interface BattleShipMenuRulesProps {
  exitMenuCallback(): void;
}

export function BattleShipMenuRules({ exitMenuCallback }: BattleShipMenuRulesProps): JSX.Element {
  return (
    <StackDivider>
      <Center>
        <Text fontSize='4xl' fontWeight='bold'>
          Rules
        </Text>
      </Center>
      <Center>
        <Text fontSize='2xl' fontWeight='bold'>
          Board Setup
        </Text>
      </Center>
      <Text textAlign='center'>
        The initial step for all players is to choose their boards for the game.
        <br />
        This board will be kept secret from the other player and spectators.
        <br />
        Players will be able to drag and drop their ships to their desired location on the board.
        <br />
        The following are the ships that each player will have.
      </Text>
      <Center>
        <UnorderedList textAlign='center'>
          <li>
            <Text>
              <b>Carrier:</b> 5 squares
            </Text>
          </li>
          <li>
            <Text>
              <b>Battleship:</b> 4 squares
            </Text>
          </li>
          <li>
            <Text>
              <b>Cruiser:</b> 3 squares
            </Text>
          </li>
          <li>
            <Text>
              <b>Submarine:</b> 3 squares
            </Text>
          </li>
          <li>
            <Text>
              <b>Destroyer:</b> 2 squares
            </Text>
          </li>
        </UnorderedList>
      </Center>
      <Text textAlign='center'>
        Once Both Players have their boards setup and all ships are placed the Attack Phase will
        start.
      </Text>
      <Center mt={4}>
        <Text fontSize='2xl' fontWeight='bold'>
          Attack Phase
        </Text>
      </Center>

      <List mt={0.5} textAlign='center'>
        <li>
          <Text>
            Players will see 2 boards. Their board from the previous phase and the Attack Board
            where they can attack their oppenents ships.
          </Text>
        </li>
        <li>
          <Text>Players take turns guessing grid spaces to attack on the enemys board.</Text>
        </li>
        <li>
          <Text>
            If a ship occupies the attacked square, it’s a "hit" and a red X is displayed over the
            hit square.
          </Text>
        </li>
        <li>
          <Text>
            If a ship does not occupy the attacked square, that is a miss and a blue Rombus will be
            displayed over the square.
          </Text>
        </li>
        <li>
          <Text>
            When all squares of a ship are hit, the ship is sunk. An announcment will be made, "You
            sunk [ship name]"
          </Text>
        </li>
        <li>
          <Text>
            The game ends when all of one player's ships are sunk. The other player is declared the
            winner.
          </Text>
        </li>
      </List>
      <Center mt={6}>
        <Button onClick={exitMenuCallback}>Back</Button>
      </Center>
    </StackDivider>
  );
}
